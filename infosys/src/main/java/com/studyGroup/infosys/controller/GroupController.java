package com.studyGroup.infosys.controller;

import com.studyGroup.infosys.dto.CreateGroupRequest;
import com.studyGroup.infosys.dto.GroupDTO;
import com.studyGroup.infosys.model.Group;
import com.studyGroup.infosys.model.User;
import com.studyGroup.infosys.service.GroupService;
import com.studyGroup.infosys.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @Autowired
    private UserService userService;

    // Endpoint to create a new study group.
    @PostMapping("/create")
    public ResponseEntity<?> createGroup(@RequestBody CreateGroupRequest createGroupRequest, @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            User currentUser = userService.getUserProfile(token);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
            }
            Group newGroup = groupService.createGroup(createGroupRequest, currentUser);
            // Return the DTO version of the newly created group
            return ResponseEntity.ok(GroupDTO.fromEntity(newGroup));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while creating the group: " + e.getMessage());
        }
    }

    // Endpoint to fetch all groups the current user is a member of.
    @GetMapping("/my-groups")
    public ResponseEntity<?> getMyGroups(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            User currentUser = userService.getUserProfile(token);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
            }
            // Corrected Type: List<GroupDTO>
            List<GroupDTO> myGroups = groupService.findGroupsByUserId(currentUser.getId());
            return ResponseEntity.ok(myGroups);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while fetching your groups: " + e.getMessage());
        }
    }

    // Endpoint to fetch all groups for the "Discover" section.
    @GetMapping("/all")
    public ResponseEntity<?> getAllGroups() {
        try {
            // Corrected Type: List<GroupDTO>
            List<GroupDTO> allGroups = groupService.getAllGroups();
            return ResponseEntity.ok(allGroups);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while fetching all groups: " + e.getMessage());
        }
    }
}

