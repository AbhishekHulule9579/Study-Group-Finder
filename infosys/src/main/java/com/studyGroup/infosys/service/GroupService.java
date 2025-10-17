package com.studyGroup.infosys.service;

import com.studyGroup.infosys.dto.CreateGroupRequest;
import com.studyGroup.infosys.dto.GroupDTO;
import com.studyGroup.infosys.dto.JoinRequestDTO;
import com.studyGroup.infosys.dto.UserSummaryDTO;
import com.studyGroup.infosys.model.*;
import com.studyGroup.infosys.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {
    private final GroupRepository groupRepository;
    private final UsersRepository usersRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupJoinRequestRepository groupJoinRequestRepository;
    private final NotificationService notificationService;
    private final CourseRepository courseRepository;


    @Transactional
    public Group createGroup(CreateGroupRequest createGroupRequest, String adminEmail){
        User admin = usersRepository.findByEmail(adminEmail).orElseThrow(()->new RuntimeException("Admin not found"));

        Group group = new Group();
        group.setName(createGroupRequest.getName());
        group.setDescription(createGroupRequest.getDescription());
        group.setPrivacy(createGroupRequest.getPrivacy());
        group.setPasskey(createGroupRequest.getPasskey());
        group.setMemberLimit(createGroupRequest.getMemberLimit());
        group.setCreatedBy(admin);

        if (createGroupRequest.getAssociatedCourseId() != null && !createGroupRequest.getAssociatedCourseId().isEmpty()) {
            String courseId = createGroupRequest.getAssociatedCourseId();
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found with ID: " + courseId));
            group.setAssociatedCourse(course);
        }


        Group savedGroup = groupRepository.save(group);
        GroupMember groupMember = new GroupMember();
        groupMember.setId(new GroupMemberId(savedGroup.getGroupId(), admin.getId()));
        groupMember.setGroup(savedGroup);
        groupMember.setUser(admin);
        groupMemberRepository.save(groupMember);

        String message = "You have created a new group: '" + savedGroup.getName() + "'.";
        notificationService.createNotification(admin, message);
        return savedGroup;
    }

    public List<Group> getAllPublicGroups(){
        return groupRepository.findByPrivacyIgnoreCase("public");
    }

    public List<GroupDTO> getGroupsByAdmin(String email) {
        User user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return groupRepository.findByCreatedBy(user).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public GroupDTO getGroupDetails(Long groupId) {
        return groupRepository.findById(groupId)
                .map(this::mapToDTOWithMembers)
                .orElse(null);
    }

    @Transactional
    public void joinGroup(Long groupId, User user) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));

        boolean isMember = groupMemberRepository.existsById(new GroupMemberId(groupId, user.getId()));
        if (isMember) {
            throw new IllegalStateException("You are already a member of this group.");
        }

        if ("private".equalsIgnoreCase(group.getPrivacy())) {
            // Logic for private group: create a join request
            boolean hasRequested = groupJoinRequestRepository.existsByGroupAndUser(group, user);
            if (hasRequested) {
                throw new IllegalStateException("You have already sent a request to join this group.");
            }
            GroupJoinRequest joinRequest = new GroupJoinRequest();
            joinRequest.setGroup(group);
            joinRequest.setUser(user);
            joinRequest.setStatus("PENDING");
            groupJoinRequestRepository.save(joinRequest);

            // Notify admin
            String adminMessage = user.getName() + " has requested to join your group '" + group.getName() + "'.";
            notificationService.createNotification(group.getCreatedBy(), adminMessage);

        } else {
            // Logic for public group: add member directly
            GroupMember groupMember = new GroupMember();
            groupMember.setId(new GroupMemberId(groupId, user.getId()));
            groupMember.setGroup(group);
            groupMember.setUser(user);
            groupMemberRepository.save(groupMember);

            String message = "You have joined the group '" + group.getName() + "'.";
            notificationService.createNotification(user, message);
        }
    }


    public List<JoinRequestDTO> getJoinRequestsForGroup(Long groupId, String adminEmail) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User admin = usersRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!group.getCreatedBy().equals(admin)) {
            throw new SecurityException("Only the group admin can view join requests.");
        }

        return groupJoinRequestRepository.findByGroupAndStatus(group, "PENDING")
                .stream()
                .map(this::mapRequestToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void acceptJoinRequest(Long requestId, String adminEmail) {
        GroupJoinRequest joinRequest = groupJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Join request not found"));
        User admin = usersRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!joinRequest.getGroup().getCreatedBy().equals(admin)) {
            throw new SecurityException("Only the group admin can approve requests.");
        }

        joinRequest.setStatus("APPROVED");
        groupJoinRequestRepository.delete(joinRequest); // Remove the request once handled

        GroupMember groupMember = new GroupMember();
        groupMember.setId(new GroupMemberId(joinRequest.getGroup().getGroupId(), joinRequest.getUser().getId()));
        groupMember.setGroup(joinRequest.getGroup());
        groupMember.setUser(joinRequest.getUser());
        groupMemberRepository.save(groupMember);

        // Notify user
        User userToNotify = joinRequest.getUser();
        String groupName = joinRequest.getGroup().getName();
        String message = "Your request to join the group '" + groupName + "' has been accepted.";
        notificationService.createNotification(userToNotify, message);

    }

    @Transactional
    public void rejectJoinRequest(Long requestId, String adminEmail) {
        GroupJoinRequest joinRequest = groupJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Join request not found"));
        User admin = usersRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!joinRequest.getGroup().getCreatedBy().equals(admin)) {
            throw new SecurityException("Only the group admin can reject requests.");
        }

        groupJoinRequestRepository.delete(joinRequest); // Remove the request once handled

        // Notify user
        User userToNotify = joinRequest.getUser();
        String groupName = joinRequest.getGroup().getName();
        String message = "Your request to join the group '" + groupName + "' has been rejected.";
        notificationService.createNotification(userToNotify, message);
    }

    @Transactional
    public void removeAllMembersFromGroup(Long groupId, String adminEmail) {
        User admin = usersRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!group.getCreatedBy().equals(admin)) {
            throw new SecurityException("Only the admin can delete all members.");
        }
        List<GroupMember> members = groupMemberRepository.findByGroup(group);

        for(GroupMember member: members){
            if(!member.getUser().equals(admin)){
                String groupName = group.getName();
                String message = "The group '" + groupName + "' has been disbanded by the admin.";
                notificationService.createNotification(member.getUser(), message);
                groupMemberRepository.delete(member);
            }
        }
    }


    private GroupDTO mapToDTO(Group group) {
        GroupDTO dto = new GroupDTO();
        dto.setGroupId(group.getGroupId());
        dto.setName(group.getName());
        dto.setDescription(group.getDescription());
        dto.setPrivacy(group.getPrivacy());
        if (group.getCreatedBy() != null) {
            dto.setAdminName(group.getCreatedBy().getName());
        }
        long memberCount = groupMemberRepository.countByGroup(group);
        dto.setMemberCount(memberCount);
        return dto;
    }
    private GroupDTO mapToDTOWithMembers(Group group) {
        GroupDTO dto = mapToDTO(group);
        List<UserSummaryDTO> members = groupMemberRepository.findByGroup(group)
                .stream()
                .map(GroupMember::getUser)
                .map(user -> new UserSummaryDTO(user.getId(), user.getName(), user.getEmail()))
                .collect(Collectors.toList());
        dto.setMembers(members);
        return dto;
    }

    private JoinRequestDTO mapRequestToDTO(GroupJoinRequest request) {
        User user = request.getUser();
        UserSummaryDTO userSummary = new UserSummaryDTO(user.getId(), user.getName(), user.getEmail());
        return new JoinRequestDTO(request.getId(), userSummary);
    }
}

