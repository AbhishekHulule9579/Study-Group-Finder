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

    private UserSummaryDTO convertToUserSummaryDTO(GroupMember member) {
        return new UserSummaryDTO(
                Long.valueOf(member.getUser().getId()),
                member.getUser().getName(),
                member.getRole()
        );
    }

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
                new UserSummaryDTO(Long.valueOf(group.getCreatedBy().getId()), group.getCreatedBy().getName(), "Admin"),
                group.getPrivacy(),
                group.getMemberLimit(),
                memberCount,
                hasPasskey,
                userRole
        );
    }

    @Transactional
    public GroupDTO updateGroup(Long groupId, GroupDTO groupDetails, User currentUser) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));

        boolean isAdmin = groupMemberRepository.findByGroupGroupIdAndUser_Id(groupId, currentUser.getId())
                .map(m -> "Admin".equalsIgnoreCase(m.getRole()))
                .orElse(false);

        if (!isAdmin) {
            throw new RuntimeException("You are not authorized to update this group's details. (Only an Admin can)");
        }

        group.setName(groupDetails.getName());
        group.setDescription(groupDetails.getDescription());
        Group updatedGroup = groupRepository.save(group);

        String userRole = groupMemberRepository.findByGroupGroupIdAndUser_Id(groupId, currentUser.getId())
                .map(GroupMember::getRole)
                .orElse("non-member");

        return convertToDTO(updatedGroup, userRole);
    }

    public GroupDTO getGroupDetails(Long groupId, User currentUser) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));

        Optional<GroupMember> membership = getMembership(groupId, currentUser);
        String userRole = membership.map(GroupMember::getRole).orElse("non-member");
        boolean isMember = membership.isPresent();

        if ("PRIVATE".equalsIgnoreCase(group.getPrivacy()) && !isMember) {
            throw new RuntimeException("You are not authorized to view this private group's details.");
        }

        return convertToDTO(group, userRole);
    }

    public List<UserSummaryDTO> getGroupMembers(Long groupId, User currentUser) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));

        if (getMembership(groupId, currentUser).isEmpty()) {
            throw new RuntimeException("You must be a member of this group to view the member list.");
        }

        List<GroupMember> members = groupMemberRepository.findByGroup(group);

        return members.stream()
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
        ownerMembership.setRole("Admin");
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
                if (groupJoinRequestRepository.existsByGroupAndUserAndStatus(group, user, "PENDING")) {
                    throw new RuntimeException("You have already sent a request to join this group.");
                }

                GroupJoinRequest joinRequest = new GroupJoinRequest();
                joinRequest.setGroup(group);
                joinRequest.setUser(user);
                joinRequest.setStatus("PENDING");
                groupJoinRequestRepository.save(joinRequest);
                return;
            }
        }

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

        boolean isAdmin = groupMemberRepository.findByGroupGroupIdAndUser_Id(groupId, currentUser.getId())
                .map(m -> "Admin".equalsIgnoreCase(m.getRole()))
                .orElse(false);

        if (!group.getCreatedBy().getId().equals(currentUser.getId()) && !isAdmin) {
            throw new RuntimeException("You are not authorized to view join requests for this group.");
        }

        return groupJoinRequestRepository.findByGroupAndStatus(group, "PENDING").stream()
                .map(req -> new GroupJoinRequestDTO(
                        req.getId(),
                        new UserSummaryDTO(Long.valueOf(req.getUser().getId()), req.getUser().getName(), "Pending"),
                        req.getStatus()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public void handleJoinRequest(Long requestId, String status, User currentUser) {
        GroupJoinRequest request = groupJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found."));

        Group group = request.getGroup();

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
