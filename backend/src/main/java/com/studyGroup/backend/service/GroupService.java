package com.studyGroup.backend.service;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.studyGroup.backend.dto.CourseSummaryDTO;
import com.studyGroup.backend.dto.CreateGroupRequest;
import com.studyGroup.backend.dto.GroupDTO;
import com.studyGroup.backend.dto.GroupJoinRequestDTO;
import com.studyGroup.backend.dto.UserSummaryDTO;
import com.studyGroup.backend.model.*;
import com.studyGroup.backend.repository.GroupJoinRequestRepository;
import com.studyGroup.backend.repository.GroupMemberRepository;
import com.studyGroup.backend.repository.GroupRepository;
import com.studyGroup.backend.repository.ProfileRepository;

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
    
    @Autowired
    private ProfileRepository profileRepository; 

    /**
     * Helper method to retrieve the "About Me" field from the Profile entity.
     * Searches by email using the defined repository method.
     */
    private String getUserAboutMe(User user) {
        if (user == null || user.getEmail() == null) return null;
        
        // Explicitly use the findByEmail method (as defined in your ProfileRepository)
        Optional<Profile> profile = profileRepository.findByEmail(user.getEmail());

        if (profile.isPresent()) {
            String aboutMe = profile.get().getAboutMe();
            
            // Defensive check: Return null if the string is empty or just whitespace in the DB
            if (aboutMe != null && !aboutMe.trim().isEmpty()) {
                return aboutMe.trim();
            }
        }
        // Returns null if no Profile is found or if the aboutMe field is empty/null
        return null;
    }

    /**
     * Helper to convert GroupMember to DTO, pulling 'aboutMe' from Profile.
     */
    private UserSummaryDTO convertToUserSummaryDTO(GroupMember member) {
        User user = member.getUser();
        String aboutMe = getUserAboutMe(user);

        return new UserSummaryDTO(
                Long.valueOf(user.getId()),
                user.getName(),
                user.getEmail(),
                aboutMe, 
                member.getRole()
        );
    }

    private Optional<GroupMember> getMembership(Long groupId, User user) {
        return groupMemberRepository.findByGroupGroupIdAndUser_Id(groupId, user.getId());
    }

    private GroupDTO convertToDTO(Group group) {
        return convertToDTO(group, null);
    }

    /**
     * Helper to convert Group to DTO, pulling creator 'aboutMe' from Profile.
     */
    private GroupDTO convertToDTO(Group group, String userRole) {
        long memberCount = groupMemberRepository.countByGroup(group);
        boolean hasPasskey = group.getPasskey() != null && !group.getPasskey().isEmpty();
        User creator = group.getCreatedBy();
        String creatorAboutMe = getUserAboutMe(creator);

        return new GroupDTO(
                group.getGroupId(),
                group.getName(),
                group.getDescription(),
                new CourseSummaryDTO(group.getAssociatedCourse().getCourseId(), group.getAssociatedCourse().getCourseName()),
                new UserSummaryDTO(Long.valueOf(creator.getId()), creator.getName(), creator.getEmail(), creatorAboutMe, "Admin"), 
                group.getPrivacy(),
                group.getMemberLimit(),
                memberCount,
                hasPasskey,
                userRole
        );
    }

    @Transactional
    public String leaveGroup(Long groupId, User currentUser) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));

        Optional<GroupMember> optionalMembership = groupMemberRepository.findByGroupGroupIdAndUser_Id(groupId, currentUser.getId());

        if (optionalMembership.isEmpty()) {
            throw new RuntimeException("You are not a member of this group.");
        }

        GroupMember membership = optionalMembership.get();
        String role = membership.getRole();

        groupMemberRepository.delete(membership);

        if ("Admin".equalsIgnoreCase(role)) {
            Long remainingMembers = groupMemberRepository.countByGroup(group);

            if (remainingMembers == 0) {
                groupJoinRequestRepository.deleteByGroup(group);
                groupRepository.delete(group);

                return "Successfully left the group. The group has been deleted completely as you were the last member.";
            } else {
                List<GroupMember> remainingGroupMembers = groupMemberRepository.findByGroup(group);

                if (!remainingGroupMembers.isEmpty()) {
                    Optional<GroupMember> nextAdminOptional = remainingGroupMembers.stream()
                        .filter(m -> !"Admin".equalsIgnoreCase(m.getRole()))
                        .findFirst();

                    if (nextAdminOptional.isEmpty()) {
                         nextAdminOptional = remainingGroupMembers.stream().findFirst();
                    }

                    if (nextAdminOptional.isPresent()) {
                        GroupMember nextAdmin = nextAdminOptional.get();
                        nextAdmin.setRole("Admin");
                        groupMemberRepository.save(nextAdmin);

                        group.setCreatedBy(nextAdmin.getUser());
                        groupRepository.save(group);

                        return "Successfully left the group. Ownership has been transferred to " + nextAdmin.getUser().getName() + ", who is now the new Admin.";
                    }
                }
                return "Successfully left the group. The group remains active, but ownership transfer succeeded/failed (check group status).";
            }
        }
        return "Successfully left the group.";
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

    /**
     * Retrieves join requests for a specific group.
     */
    public List<GroupJoinRequestDTO> getJoinRequests(Long groupId, User currentUser) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found."));

        boolean isAdmin = groupMemberRepository.findByGroupGroupIdAndUser_Id(groupId, currentUser.getId())
                .map(m -> "Admin".equalsIgnoreCase(m.getRole()))
                .orElse(false);

        if (!isAdmin) {
            throw new RuntimeException("You are not authorized to view join requests for this group.");
        }

        // Fetch PENDING requests only
        return groupJoinRequestRepository.findByGroupAndStatus(group, "PENDING").stream()
                .map(req -> new GroupJoinRequestDTO(
                        req.getId(),
                        new UserSummaryDTO(
                                Long.valueOf(req.getUser().getId()), 
                                req.getUser().getName(), 
                                req.getUser().getEmail(), 
                                getUserAboutMe(req.getUser()), // Correctly fetching bio from Profile
                                "Pending"
                        ),
                        req.getStatus()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Handles group join requests (accept/reject).
     */
    @Transactional
    public void handleJoinRequest(Long groupId, Long requestId, String status, User currentUser) {
        // 1. Authorization Check (Admin of this specific group)
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found."));

        boolean isAdmin = groupMemberRepository.findByGroupGroupIdAndUser_Id(groupId, currentUser.getId())
                .map(m -> "Admin".equalsIgnoreCase(m.getRole()))
                .orElse(false);

        if (!isAdmin) {
            throw new RuntimeException("You are not authorized to manage requests for this group.");
        }
        
        // 2. Find and Validate Request
        GroupJoinRequest request = groupJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found."));
                
        if (!request.getGroup().getGroupId().equals(groupId)) {
             throw new RuntimeException("Request ID does not belong to the provided Group ID.");
        }

        if ("APPROVED".equalsIgnoreCase(status)) {
            // 3. Check member limit before adding
            long currentMemberCount = groupMemberRepository.countByGroup(group);
            if (currentMemberCount >= group.getMemberLimit()) {
                groupJoinRequestRepository.delete(request); 
                throw new RuntimeException("Group is full. Cannot approve this request.");
            }
            
            // Add member
            GroupMember newMembership = new GroupMember();
            newMembership.setId(new GroupMemberId(group.getGroupId(), request.getUser().getId()));
            newMembership.setGroup(group);
            newMembership.setUser(request.getUser());
            newMembership.setRole("Member");
            groupMemberRepository.save(newMembership);
        } else if (!"DENIED".equalsIgnoreCase(status)) {
             throw new RuntimeException("Invalid status provided. Must be APPROVED or DENIED.");
        }

        // 4. Delete the request after handling to clear it from the pending list
        groupJoinRequestRepository.delete(request);
    }
    
    /**
     * NEW METHOD: Allows an Admin to remove a member.
     */
    @Transactional
    public void removeMember(Long groupId, Long memberIdToRemove, User currentUser) {
        // 1. Authorization Check: Current user must be an Admin
        GroupMember adminMembership = groupMemberRepository.findByGroupGroupIdAndUser_Id(groupId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Group not found or you are not a member."));

        if (!"Admin".equalsIgnoreCase(adminMembership.getRole())) {
            throw new RuntimeException("You are not authorized to remove members from this group.");
        }
        
        // 2. Prevent self-removal
        if (currentUser.getId().equals(memberIdToRemove.intValue())) {
             throw new RuntimeException("You cannot remove yourself. Use the leave group button instead.");
        }

        // 3. Find group and member
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found."));
                
        GroupMember memberToRemove = groupMemberRepository.findByGroupGroupIdAndUser_Id(groupId, memberIdToRemove.intValue())
                .orElseThrow(() -> new RuntimeException("Member not found in this group."));
        
        // 4. Cannot remove the original creator
        if (memberToRemove.getUser().getId().equals(group.getCreatedBy().getId())) {
             throw new RuntimeException("The original group creator cannot be removed by other admins.");
        }
        
        // 5. Remove the member
        groupMemberRepository.delete(memberToRemove);
        
        // 6. Clean up any related join requests (Requires deleteByGroupAndUser in repository)
        groupJoinRequestRepository.deleteByGroupAndUser(group, memberToRemove.getUser()); 
    }
    
    /**
     * NEW METHOD: Allows an Admin to change a non-creator/non-self member's role.
     */
    @Transactional
    public void changeMemberRole(Long groupId, Long memberIdToUpdate, String newRole, User currentUser) {
        // 1. Authorization Check (Admin)
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found."));

        boolean isAdmin = groupMemberRepository.findByGroupGroupIdAndUser_Id(groupId, currentUser.getId())
                .map(m -> "Admin".equalsIgnoreCase(m.getRole()))
                .orElse(false);

        if (!isAdmin) {
            throw new RuntimeException("You are not authorized to change member roles.");
        }
        
        // 2. Cannot change role for yourself or the group creator
        if (currentUser.getId().equals(memberIdToUpdate.intValue())) {
             throw new RuntimeException("You cannot change your own role through this management tool.");
        }
        if (memberIdToUpdate.intValue() == group.getCreatedBy().getId()) {
             throw new RuntimeException("The original group creator's role cannot be modified.");
        }

        // 3. Find and update the member's role
        GroupMember memberToUpdate = groupMemberRepository.findByGroupGroupIdAndUser_Id(groupId, memberIdToUpdate.intValue())
                .orElseThrow(() -> new RuntimeException("Member not found in this group."));
        
        memberToUpdate.setRole(newRole);
        groupMemberRepository.save(memberToUpdate);
    }
}