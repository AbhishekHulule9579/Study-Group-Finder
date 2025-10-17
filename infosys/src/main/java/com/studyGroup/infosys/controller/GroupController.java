package com.studyGroup.infosys.controller;

import com.studyGroup.infosys.dto.CreateGroupRequest;
import com.studyGroup.infosys.dto.GroupDTO;
import com.studyGroup.infosys.dto.JoinRequestDTO;
import com.studyGroup.infosys.model.Group;
import com.studyGroup.infosys.model.User;
import com.studyGroup.infosys.service.GroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "http://localhost:5173")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createGroup(@RequestBody CreateGroupRequest createGroupRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        Group group = groupService.createGroup(createGroupRequest, currentUser.getEmail());
        return ResponseEntity.ok(group);
    }


    @GetMapping("/my-groups")
    public ResponseEntity<List<GroupDTO>> getMyGroups() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        List<GroupDTO> myGroups = groupService.getGroupsByAdmin(currentUser.getEmail());
        return ResponseEntity.ok(myGroups);
    }

    @DeleteMapping("/{groupId}/remove-all-members")
    public ResponseEntity<?> removeAllMembers(@PathVariable Long groupId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        groupService.removeAllMembersFromGroup(groupId, currentUser.getEmail());
        return ResponseEntity.ok(Map.of("message", "All members have been removed from the group."));
    }


    @GetMapping("/public")
    public ResponseEntity<List<Group>> getAllPublicGroups() {
        return ResponseEntity.ok(groupService.getAllPublicGroups());
    }

    @PostMapping("/{groupId}/join")
    public ResponseEntity<?> joinGroup(@PathVariable Long groupId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        groupService.joinGroup(groupId, currentUser);
        return ResponseEntity.ok(Map.of("message", "Successfully joined the group or request sent."));
    }

    @GetMapping("/{groupId}/requests")
    public ResponseEntity<List<JoinRequestDTO>> getJoinRequests(@PathVariable Long groupId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        List<JoinRequestDTO> requests = groupService.getJoinRequestsForGroup(groupId, currentUser.getEmail());
        return ResponseEntity.ok(requests);
    }


    @PostMapping("/requests/{requestId}/accept")
    public ResponseEntity<?> acceptJoinRequest(@PathVariable Long requestId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        groupService.acceptJoinRequest(requestId, currentUser.getEmail());
        return ResponseEntity.ok(Map.of("message", "Join request accepted."));
    }

    @PostMapping("/requests/{requestId}/reject")
    public ResponseEntity<?> rejectJoinRequest(@PathVariable Long requestId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        groupService.rejectJoinRequest(requestId, currentUser.getEmail());
        return ResponseEntity.ok(Map.of("message", "Join request rejected."));
    }
}

