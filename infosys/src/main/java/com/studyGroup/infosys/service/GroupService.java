package com.studyGroup.infosys.service;

import com.studyGroup.infosys.dto.CourseSummaryDTO;
import com.studyGroup.infosys.dto.CreateGroupRequest;
import com.studyGroup.infosys.dto.GroupDTO;
import com.studyGroup.infosys.dto.GroupJoinRequestDTO;
import com.studyGroup.infosys.dto.UserSummaryDTO;
import com.studyGroup.infosys.model.*;
import com.studyGroup.infosys.repository.GroupJoinRequestRepository;
import com.studyGroup.infosys.repository.GroupMemberRepository;
import com.studyGroup.infosys.repository.GroupRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GroupService {

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private CourseService courseService;

    @Autowired
    private GroupJoinRequestRepository groupJoinRequestRepository;

    // Helper to get UserSummaryDTO for a GroupMember
    private UserSummaryDTO convertToUserSummaryDTO(GroupMember member) {
        return new UserSummaryDTO(member.getUser().getId(), member.getUser().getName());
    }

    // FIX: Updated method call to match the new repository method name
    private Optional<GroupMember> getMembership(Long groupId, User user) {
        return groupMemberRepository.findByGroupGroupIdAndUser_Id(groupId, user.getId());
    }

    private GroupDTO convertToDTO(Group group) {
        return convertToDTO(group, null);
    }

    private GroupDTO convertToDTO(Group group, String userRole) {
        long memberCount = groupMemberRepository.countByGroup(group);
        boolean hasPasskey = group.getPasskey() != null && !group.getPasskey().isEmpty();
        return new GroupDTO(
                group.getGroupId(),
                group.getName(),
                group.getDescription(),
                new CourseSummaryDTO(group.getAssociatedCourse().getCourseId(), group.getAssociatedCourse().getCourseName()),
                new UserSummaryDTO(group.getCreatedBy().getId(), group.getCreatedBy().getName()),
                group.getPrivacy(),
                group.getMemberLimit(),
                memberCount,
                hasPasskey,
                userRole
        );
    }

    /**
     * Fetches group details, performing authorization check.
     * @throws RuntimeException if the group is private and the user is not a member.
     */
    public GroupDTO getGroupDetails(Long groupId, User currentUser) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));

        Optional<GroupMember> membership = getMembership(groupId, currentUser);
        String userRole = membership.map(GroupMember::getRole).orElse("non-member");
        boolean isMember = membership.isPresent();
        
        // Authorization check: If group is private AND user is not a member, forbid access.
        if ("PRIVATE".equalsIgnoreCase(group.getPrivacy()) && !isMember) {
            throw new RuntimeException("You are not authorized to view this private group's details.");
        }

        // For public groups or for members of private groups, return the details.
        return convertToDTO(group, userRole);
    }

    /**
     * Fetches group members, performing authorization check.
     * @throws RuntimeException if the user is not a member.
     */
    public List<UserSummaryDTO> getGroupMembers(Long groupId, User currentUser) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));

        Optional<GroupMember> membership = getMembership(groupId, currentUser);
        
        // Authorization check: Only members can see the full member list.
        if (!membership.isPresent()) {
            throw new RuntimeException("You must be a member of this group to view the member list.");
        }
        
        // Fetch GroupMember entities and convert them to UserSummaryDTO
        List<GroupMember> members = groupMemberRepository.findByGroup(group);
        
        return members.stream()
                // Convert to a DTO suitable for member list display
                .map(this::convertToUserSummaryDTO)
                .collect(Collectors.toList());
    }


    public List<GroupDTO> findGroupsByUserId(Integer userId) {
        List<GroupMember> memberships = groupMemberRepository.findByUserId(userId);
        return memberships.stream()
                .map(membership -> convertToDTO(membership.getGroup(), membership.getRole()))
                .collect(Collectors.toList());
    }

    @Transactional
    public GroupDTO createGroup(CreateGroupRequest request, User user) {
        Course course = courseService.getCourseById(request.getAssociatedCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found with ID: " + request.getAssociatedCourseId()));

        Group group = new Group();
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setAssociatedCourse(course);
        group.setCreatedBy(user);
        group.setPrivacy(request.getPrivacy());
        group.setMemberLimit(request.getMemberLimit());

        if ("private".equalsIgnoreCase(request.getPrivacy()) && request.getPasskey() != null && !request.getPasskey().isEmpty()) {
            group.setPasskey(request.getPasskey());
        }

        Group savedGroup = groupRepository.save(group);

        GroupMember ownerMembership = new GroupMember();
        ownerMembership.setId(new GroupMemberId(savedGroup.getGroupId(), user.getId()));
        ownerMembership.setGroup(savedGroup);
        ownerMembership.setUser(user);
        ownerMembership.setRole("Admin"); // Set role to Admin for the creator
        groupMemberRepository.save(ownerMembership);

        return convertToDTO(savedGroup, "Admin");
    }

    public List<GroupDTO> getAllGroups() {
        return groupRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void joinGroup(Long groupId, User user, String passkey) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));

        if (groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new RuntimeException("You are already a member of this group.");
        }

        long currentMemberCount = groupMemberRepository.countByGroup(group);
        if (currentMemberCount >= group.getMemberLimit()) {
            throw new RuntimeException("This group is full and cannot accept new members.");
        }

        if ("private".equalsIgnoreCase(group.getPrivacy())) {
            if (group.getPasskey() != null && !group.getPasskey().isEmpty()) {
                if (passkey == null || !passkey.equals(group.getPasskey())) {
                    throw new RuntimeException("Invalid passkey for this private group.");
                }
            } else {
                // Private group without a passkey, so create a join request
                if (groupJoinRequestRepository.existsByGroupAndUserAndStatus(group, user, "PENDING")) {
                    throw new RuntimeException("You have already sent a request to join this group.");
                }
                GroupJoinRequest joinRequest = new GroupJoinRequest();
                joinRequest.setGroup(group);
                joinRequest.setUser(user);
                joinRequest.setStatus("PENDING");
                groupJoinRequestRepository.save(joinRequest);
                return; // Exit after creating the request
            }
        }

        // For public groups or private groups with a correct passkey
        GroupMember newMembership = new GroupMember();
        newMembership.setId(new GroupMemberId(group.getGroupId(), user.getId()));
        newMembership.setGroup(group);
        newMembership.setUser(user);
        newMembership.setRole("Member");
        groupMemberRepository.save(newMembership);
    }

    public List<GroupJoinRequestDTO> getJoinRequests(Long groupId, User currentUser) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found."));

        // Only the owner (Admin in your case) can view requests.
        // Check if the current user is the creator OR an Admin member.
        boolean isAdmin = groupMemberRepository.findByGroupGroupIdAndUser_Id(groupId, currentUser.getId())
                            .map(m -> "Admin".equalsIgnoreCase(m.getRole()))
                            .orElse(false);
        
        if (!group.getCreatedBy().getId().equals(currentUser.getId()) && !isAdmin) {
             throw new RuntimeException("You are not authorized to view join requests for this group.");
        }

        return groupJoinRequestRepository.findByGroupAndStatus(group, "PENDING").stream()
                .map(req -> new GroupJoinRequestDTO(req.getId(), new UserSummaryDTO(req.getUser().getId(), req.getUser().getName()), req.getStatus()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void handleJoinRequest(Long requestId, String status, User currentUser) {
        GroupJoinRequest request = groupJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found."));

        Group group = request.getGroup();
        
        // Authorization check: Must be the group owner/admin to manage requests.
        boolean isAdmin = groupMemberRepository.findByGroupGroupIdAndUser_Id(group.getGroupId(), currentUser.getId())
                            .map(m -> "Admin".equalsIgnoreCase(m.getRole()))
                            .orElse(false);

        if (!group.getCreatedBy().getId().equals(currentUser.getId()) && !isAdmin) {
            throw new RuntimeException("You are not authorized to manage requests for this group.");
        }

        if ("APPROVED".equalsIgnoreCase(status)) {
            request.setStatus("APPROVED");
            GroupMember newMembership = new GroupMember();
            newMembership.setId(new GroupMemberId(group.getGroupId(), request.getUser().getId()));
            newMembership.setGroup(group);
            newMembership.setUser(request.getUser());
            newMembership.setRole("Member");
            groupMemberRepository.save(newMembership);
        } else if ("DENIED".equalsIgnoreCase(status)) {
            request.setStatus("DENIED");
        } else {
            throw new RuntimeException("Invalid status provided.");
        }
        groupJoinRequestRepository.save(request);
    }
}