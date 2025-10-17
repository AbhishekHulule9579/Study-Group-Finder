package com.studyGroup.infosys.controller;

import com.studyGroup.infosys.dto.CreateGroupRequest;
import com.studyGroup.infosys.dto.GroupDTO;
import com.studyGroup.infosys.dto.JoinRequestDTO;
import com.studyGroup.infosys.model.Group;
import com.studyGroup.infosys.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "http://localhost:5173")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @PostMapping
    public ResponseEntity<Group> createGroup(@RequestBody CreateGroupRequest request, Authentication authentication) {
        String username = authentication.getName();
        Group newGroup = groupService.createGroup(request, username);
        return ResponseEntity.ok(newGroup);
    }

    @GetMapping
    public ResponseEntity<List<GroupDTO>> getAllGroups() {
        return ResponseEntity.ok(groupService.getAllGroups());
    }
    
    @DeleteMapping("/{groupId}")
    public ResponseEntity<?> deleteGroup(@PathVariable Long groupId, Authentication authentication) {
        String currentUsername = authentication.getName();
        groupService.deleteGroup(groupId, currentUsername);
        return ResponseEntity.ok("Group deleted successfully.");
    }

    @DeleteMapping("/{groupId}/members")
    public ResponseEntity<?> removeAllMembers(@PathVariable Long groupId, Authentication authentication) {
        String currentUsername = authentication.getName();
        groupService.removeAllMembersFromGroup(groupId, currentUsername);
        return ResponseEntity.ok("All members removed.");
    }

    @PostMapping("/{groupId}/join")
    public ResponseEntity<?> requestToJoinGroup(@PathVariable Long groupId, Authentication authentication) {
        String username = authentication.getName();
        groupService.requestToJoinGroup(groupId, username);
        return ResponseEntity.ok("Join request sent.");
    }

    @GetMapping("/{groupId}/requests")
    public ResponseEntity<List<JoinRequestDTO>> getJoinRequests(@PathVariable Long groupId, Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(groupService.getPendingRequests(groupId, username));
    }

    @PostMapping("/requests/{requestId}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long requestId, Authentication authentication) {
        String currentUsername = authentication.getName();
        groupService.approveJoinRequest(requestId, currentUsername);
        return ResponseEntity.ok("Request approved");
    }

    @PostMapping("/requests/{requestId}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long requestId, Authentication authentication) {
        String currentUsername = authentication.getName();
        groupService.rejectJoinRequest(requestId, currentUsername);
        return ResponseEntity.ok("Request rejected");
    }
}
