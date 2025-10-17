package com.studyGroup.infosys.service;

import com.studyGroup.infosys.dto.CreateGroupRequest;
import com.studyGroup.infosys.dto.GroupDTO;
import com.studyGroup.infosys.dto.JoinRequestDTO;
import com.studyGroup.infosys.dto.UserSummaryDTO;
import com.studyGroup.infosys.model.Group;
import com.studyGroup.infosys.model.GroupJoinRequest;
import com.studyGroup.infosys.model.GroupMember;
import com.studyGroup.infosys.model.User;
import com.studyGroup.infosys.repository.GroupJoinRequestRepository;
import com.studyGroup.infosys.repository.GroupMemberRepository;
import com.studyGroup.infosys.repository.GroupRepository;
import com.studyGroup.infosys.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private UsersRepository usersRepository;
    @Autowired
    private GroupMemberRepository groupMemberRepository;
    @Autowired
    private GroupJoinRequestRepository groupJoinRequestRepository;
    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Group createGroup(CreateGroupRequest request, String username) {
        User creator = usersRepository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Group newGroup = new Group();
        newGroup.setName(request.getName());
        newGroup.setDescription(request.getDescription());
        newGroup.setCreator(creator);
        Group savedGroup = groupRepository.save(newGroup);

        GroupMember ownerMember = new GroupMember();
        ownerMember.setGroup(savedGroup);
        ownerMember.setUser(creator);
        ownerMember.setRole("OWNER");
        groupMemberRepository.save(ownerMember);

        notificationService.createNotification(creator, "Your group '" + savedGroup.getName() + "' has been created.", "/groups/" + savedGroup.getGroupId());


        return savedGroup;
    }

    @Transactional
    public void deleteGroup(Long groupId, String currentUsername) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));
        if (!group.getCreator().getEmail().equals(currentUsername)) {
            throw new RuntimeException("Only the group creator can delete the group.");
        }
        
        removeAllMembersFromGroup(groupId, currentUsername);
        
        groupRepository.delete(group);
        String url = "/groups/" + group.getGroupId() + "/manage";
        notificationService.createNotification(group.getCreator(), "Group '" + group.getName() + "' has been deleted.", url);

    }
    
    @Transactional
    public void removeAllMembersFromGroup(Long groupId, String currentUsername) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with id: " + groupId));

        if (!group.getCreator().getEmail().equals(currentUsername)) {
            throw new RuntimeException("Only the group creator can remove all members.");
        }
        groupMemberRepository.deleteByGroup(group);
    }


    @Transactional
    public void requestToJoinGroup(Long groupId, String username) {
        User user = usersRepository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));

        boolean isAlreadyMember = groupMemberRepository.existsByGroupAndUser(group, user);
        if(isAlreadyMember){
            throw new RuntimeException("User is already a member of this group");
        }
        boolean hasPendingRequest = groupJoinRequestRepository.existsByGroupAndUser(group, user);
        if(hasPendingRequest){
            throw new RuntimeException("User already has a pending join request for this group.");
        }


        GroupJoinRequest joinRequest = new GroupJoinRequest();
        joinRequest.setGroup(group);
        joinRequest.setUser(user);
        joinRequest.setStatus("PENDING");
        groupJoinRequestRepository.save(joinRequest);

        String url = "/groups/" + group.getGroupId();
        notificationService.createNotification(group.getCreator(), "New request to join '" + group.getName() + "' from " + user.getEmail(), url);

    }

    @Transactional(readOnly = true)
    public List<JoinRequestDTO> getPendingRequests(Long groupId, String username) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));
        if (!group.getCreator().getEmail().equals(username)) {
            throw new RuntimeException("Only group creator can view requests.");
        }
        return groupJoinRequestRepository.findByGroupAndStatus(group, "PENDING")
                .stream()
                .map(req -> new JoinRequestDTO(req.getId(), req.getUser().getFirstName() + " " + req.getUser().getLastName(), req.getStatus()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void approveJoinRequest(Long requestId, String currentUsername) {
        GroupJoinRequest request = groupJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        Group group = request.getGroup();
        User requester = request.getUser();

        if (!group.getCreator().getEmail().equals(currentUsername)) {
            throw new RuntimeException("Only group creator can approve requests.");
        }


        GroupMember member = new GroupMember();
        member.setGroup(group);
        member.setUser(requester);
        member.setRole("MEMBER");
        groupMemberRepository.save(member);

        groupJoinRequestRepository.delete(request);

        notificationService.createNotification(requester, "Your request to join '" + group.getName() + "' has been approved.", "/groups/" + group.getGroupId());
    }

    @Transactional
    public void rejectJoinRequest(Long requestId, String currentUsername) {
        GroupJoinRequest request = groupJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        Group group = request.getGroup();
        User requester = request.getUser();

        if (!group.getCreator().getEmail().equals(currentUsername)) {
            throw new RuntimeException("Only group creator can reject requests.");
        }

        groupJoinRequestRepository.delete(request);

        notificationService.createNotification(requester, "Your request to join '" + group.getName() + "' has been rejected.", "/groups");
    }


    public List<UserSummaryDTO> getGroupMembers(Long groupId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));
        return group.getMembers().stream()
                .map(groupMember -> {
                    if (!group.getGroupId().equals(groupMember.getGroup().getGroupId())) {
                        // This case should ideally not happen if data is consistent
                        return null;
                    }
                    User user = groupMember.getUser();
                    return new UserSummaryDTO(user.getId(), user.getFirstName(), user.getLastName(), user.getEmail());
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }


    public void removeMemberFromGroup(Long groupId, String memberUsername, String currentUsername) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));
        User member = usersRepository.findByEmail(memberUsername).orElseThrow(() -> new UsernameNotFoundException("Member not found"));
        User remover = usersRepository.findByEmail(currentUsername).orElseThrow(() -> new UsernameNotFoundException("Current user not found"));

        if (!member.getEmail().equals(currentUsername) && !group.getCreator().getEmail().equals(currentUsername)) {
            throw new RuntimeException("You can only remove yourself or be removed by the group admin.");
        }

        GroupMember groupMember = groupMemberRepository.findByGroupAndUser(group, member).orElseThrow(() -> new RuntimeException("Member not found in group"));
        groupMemberRepository.delete(groupMember);

        notificationService.createNotification(member, "You have been removed from group '" + group.getName() + "' by " + remover.getEmail(), "/groups");
    }

    @Transactional
    public void leaveGroup(Long groupId, String currentUsername) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));
        User member = usersRepository.findByEmail(currentUsername).orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // If the creator tries to leave, throw an exception. They must delete the group.
        if (group.getCreator().equals(member)) {
            throw new RuntimeException("Group creator cannot leave the group. You must delete the group instead.");
        }

        GroupMember groupMember = groupMemberRepository.findByGroupAndUser(group, member).orElseThrow(() -> new RuntimeException("You are not a member of this group"));
        groupMemberRepository.delete(groupMember);

        notificationService.createNotification(group.getCreator(), member.getEmail() + " has left your group '" + group.getName() + "'", "/groups/" + group.getGroupId());
    }


    public List<GroupDTO> getGroupsForUser(String username) {
        User user = usersRepository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        List<GroupMember> memberships = groupMemberRepository.findByUser(user);
        return memberships.stream()
                .map(GroupMember::getGroup)
                .map(group -> new GroupDTO(group.getGroupId(), group.getName(), group.getDescription(), group.getCreator().getEmail()))
                .collect(Collectors.toList());
    }
    
    public Optional<GroupDTO> getGroupById(Long groupId) {
        return groupRepository.findById(groupId)
                .map(group -> new GroupDTO(group.getGroupId(), group.getName(), group.getDescription(), group.getCreator().getEmail()));
    }


    public List<GroupDTO> getAllGroups() {
        return groupRepository.findAll().stream()
                .map(group -> new GroupDTO(group.getGroupId(), group.getName(), group.getDescription(), group.getCreator().getEmail()))
                .collect(Collectors.toList());
    }
}
