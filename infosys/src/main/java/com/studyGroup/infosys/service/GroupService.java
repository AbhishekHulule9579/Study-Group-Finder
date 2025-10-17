package com.studyGroup.infosys.service;

import com.studyGroup.infosys.dto.CreateGroupRequest;
import com.studyGroup.infosys.dto.GroupDTO;
import com.studyGroup.infosys.dto.JoinRequestDTO;
import com.studyGroup.infosys.dto.UserSummaryDTO;
import com.studyGroup.infosys.model.*;
import com.studyGroup.infosys.repository.GroupJoinRequestRepository;
import com.studyGroup.infosys.repository.GroupMemberRepository;
import com.studyGroup.infosys.repository.GroupRepository;
import com.studyGroup.infosys.repository.UsersRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class GroupService {
    private final GroupRepository groupRepository;
    private final UsersRepository usersRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupJoinRequestRepository groupJoinRequestRepository;

    @Transactional
    public GroupDTO createGroup(CreateGroupRequest createGroupRequest, String username) {
        User user = usersRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        Group group = new Group();
        group.setName(createGroupRequest.getName());
        group.setDescription(createGroupRequest.getDescription());
        group.setPrivacy(createGroupRequest.getPrivacy());
        group.setCreatedBy(user);
        Group savedGroup = groupRepository.save(group);

        // Add the creator as a member
        GroupMember member = new GroupMember(new GroupMemberId(savedGroup.getId(), user.getId()), savedGroup, user, "ADMIN");
        groupMemberRepository.save(member);
        return mapToDTO(savedGroup);
    }

    public List<GroupDTO> getAllPublicGroups() {
        return groupRepository.findByPrivacyIgnoreCase("public").stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<GroupDTO> getMyGroups(String username) {
        User user = usersRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return groupRepository.findByCreatedBy(user).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public Optional<GroupDTO> getGroupById(Long groupId) {
        return groupRepository.findById(groupId).map(this::mapToDTOWithMembers);
    }

    @Transactional
    public void joinGroup(Long groupId, String username) {
        User user = usersRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        if ("public".equalsIgnoreCase(group.getPrivacy())) {
            GroupMember member = new GroupMember(new GroupMemberId(group.getId(), user.getId()), group, user, "MEMBER");
            groupMemberRepository.save(member);
        } else {
            // For private groups, create a join request
            boolean alreadyRequested = groupJoinRequestRepository.existsByGroupAndUser(group, user);
            if (alreadyRequested) {
                throw new IllegalStateException("You have already sent a join request to this group.");
            }
            GroupJoinRequest joinRequest = new GroupJoinRequest();
            joinRequest.setGroup(group);
            joinRequest.setUser(user);
            joinRequest.setStatus("PENDING");
            groupJoinRequestRepository.save(joinRequest);
        }
    }
    @Transactional
    public void approveJoinRequest(Long requestId) {
        GroupJoinRequest request = groupJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        request.setStatus("APPROVED");

        GroupMember member = new GroupMember(
                new GroupMemberId(request.getGroup().getId(), request.getUser().getId()),
                request.getGroup(),
                request.getUser(),
                "MEMBER"
        );
        groupMemberRepository.save(member);
        groupJoinRequestRepository.delete(request);
    }
    @Transactional
    public void rejectJoinRequest(Long requestId) {
        GroupJoinRequest request = groupJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        groupJoinRequestRepository.delete(request);
    }

    public List<JoinRequestDTO> getPendingJoinRequests(Long groupId, String adminUsername) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        User admin = usersRepository.findByEmail(adminUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found"));
        if (!group.getCreatedBy().equals(admin)) {
            throw new IllegalStateException("Only group admin can view join requests.");
        }
        return groupJoinRequestRepository.findByGroup(group).stream()
                .filter(req -> "PENDING".equals(req.getStatus()))
                .map(this::mapToJoinRequestDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeMember(Long groupId, Integer userId, String adminUsername) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        User admin = usersRepository.findByEmail(adminUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found"));

        if (!group.getCreatedBy().equals(admin)) {
            throw new IllegalStateException("Only group admin can remove members.");
        }
        User userToRemove = usersRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User to remove not found"));
        // Prevent admin from removing themselves
        if (userToRemove.equals(admin)) {
            throw new IllegalStateException("Admin cannot remove themselves.");
        }

        GroupMemberId memberId = new GroupMemberId(groupId, userToRemove.getId());
        groupMemberRepository.deleteById(memberId);
    }

    @Transactional
    public void deleteGroup(Long groupId, String adminUsername) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        User admin = usersRepository.findByEmail(adminUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found"));

        if (!group.getCreatedBy().equals(admin)) {
            throw new IllegalStateException("Only group admin can delete the group.");
        }

        // First remove all members and join requests
        List<GroupMember> members = groupMemberRepository.findByGroup(group);
        groupMemberRepository.deleteAll(members);
        List<GroupJoinRequest> requests = groupJoinRequestRepository.findByGroup(group);
        groupJoinRequestRepository.deleteAll(requests);

        groupRepository.delete(group);
    }


    private GroupDTO mapToDTO(Group group) {
        GroupDTO dto = new GroupDTO();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setDescription(group.getDescription());
        dto.setPrivacy(group.getPrivacy());
        if (group.getCreatedBy() != null) {
            dto.setAdminName(group.getCreatedBy().getUsername());
        }
        return dto;
    }
    private GroupDTO mapToDTOWithMembers(Group group) {
        GroupDTO dto = mapToDTO(group);
        List<GroupMember> members = groupMemberRepository.findByGroup(group);
        List<UserSummaryDTO> memberDTOs = members.stream()
                .map(member -> new UserSummaryDTO(member.getUser().getId(), member.getUser().getUsername(), member.getUser().getEmail()))
                .collect(Collectors.toList());
        dto.setMembers(memberDTOs);
        return dto;
    }
    private JoinRequestDTO mapToJoinRequestDTO(GroupJoinRequest request) {
        UserSummaryDTO userDTO = new UserSummaryDTO(request.getUser().getId(), request.getUser().getUsername(), request.getUser().getEmail());
        return new JoinRequestDTO(request.getId(), userDTO);
    }

    public List<GroupDTO> findGroupsByUserId(Integer userId) {
        User user = usersRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return groupMemberRepository.findByUser(user).stream()
                .map(GroupMember::getGroup)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
}
