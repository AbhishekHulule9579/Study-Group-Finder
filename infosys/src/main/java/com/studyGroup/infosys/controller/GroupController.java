package com.studyGroup.infosys.controller;

import com.studyGroup.infosys.dto.CreateGroupRequest;
import com.studyGroup.infosys.dto.GroupDTO;
import com.studyGroup.infosys.dto.JoinRequestDTO;
import com.studyGroup.infosys.service.GroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
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
    public ResponseEntity<GroupDTO> createGroup(@RequestBody CreateGroupRequest createGroupRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = ((UserDetails) authentication.getPrincipal()).getUsername();
        GroupDTO group = groupService.createGroup(createGroupRequest, currentUserName);
        return ResponseEntity.ok(group);
    }


    @GetMapping("/my-groups")
    public ResponseEntity<List<GroupDTO>> getMyGroups() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = ((UserDetails) authentication.getPrincipal()).getUsername();
        List<GroupDTO> myGroups = groupService.getMyGroups(currentUserName);
        return ResponseEntity.ok(myGroups);
    }

    @DeleteMapping("/{groupId}/remove-all-members")
    public ResponseEntity<?> removeAllMembers(@PathVariable Long groupId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = ((UserDetails) authentication.getPrincipal()).getUsername();
        groupService.removeAllMembersFromGroup(groupId, currentUserName);
        return ResponseEntity.ok(Map.of("message", "All members have been removed from the group."));
    }


    @GetMapping("/public")
    public ResponseEntity<List<GroupDTO>> getAllPublicGroups() {
        return ResponseEntity.ok(groupService.getAllPublicGroups());
    }

    @PostMapping("/{groupId}/join")
    public ResponseEntity<?> joinGroup(@PathVariable Long groupId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = ((UserDetails) authentication.getPrincipal()).getUsername();
        groupService.joinGroup(groupId, currentUserName);
        return ResponseEntity.ok(Map.of("message", "Successfully joined the group or request sent."));
    }

    @GetMapping("/{groupId}/requests")
    public ResponseEntity<List<JoinRequestDTO>> getJoinRequests(@PathVariable Long groupId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = ((UserDetails) authentication.getPrincipal()).getUsername();
        List<JoinRequestDTO> requests = groupService.getPendingJoinRequests(groupId, currentUserName);
        return ResponseEntity.ok(requests);
    }


    @PostMapping("/requests/{requestId}/accept")
    public ResponseEntity<?> acceptJoinRequest(@PathVariable Long requestId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = ((UserDetails) authentication.getPrincipal()).getUsername();
        groupService.approveJoinRequest(requestId, currentUserName);
        return ResponseEntity.ok(Map.of("message", "Join request accepted."));
    }

    @PostMapping("/requests/{requestId}/reject")
    public ResponseEntity<?> rejectJoinRequest(@PathVariable Long requestId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = ((UserDetails) authentication.getPrincipal()).getUsername();
        groupService.rejectJoinRequest(requestId, currentUserName);
        return ResponseEntity.ok(Map.of("message", "Join request rejected."));
    }
}
