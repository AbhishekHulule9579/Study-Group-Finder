package com.studyGroup.infosys.controller;

import com.studyGroup.infosys.dto.CreateGroupRequest;
import com.studyGroup.infosys.dto.GroupDTO;
import com.studyGroup.infosys.model.User;
import com.studyGroup.infosys.service.GroupService;
import com.studyGroup.infosys.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @Autowired
    private UserService userService;

    @PostMapping("/create")
    public ResponseEntity<?> createGroup(@RequestBody CreateGroupRequest createGroupRequest, @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            User currentUser = userService.getUserProfile(token);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
            }
            GroupDTO newGroup = groupService.createGroup(createGroupRequest, currentUser);
        
            return ResponseEntity.ok(newGroup);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while creating the group: " + e.getMessage());
        }
    }

    @GetMapping("/my-groups")
    public ResponseEntity<?> getMyGroups(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            User currentUser = userService.getUserProfile(token);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
            }
           
            List<GroupDTO> myGroups = groupService.findGroupsByUserId(currentUser.getId());
            return ResponseEntity.ok(myGroups);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while fetching your groups: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllGroups() {
        try {
           
            List<GroupDTO> allGroups = groupService.getAllGroups();
            return ResponseEntity.ok(allGroups);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while fetching all groups: " + e.getMessage());
        }
    }

    @PostMapping("/join/{groupId}")
    public ResponseEntity<?> joinGroup(@PathVariable Long groupId,
                                       @RequestHeader("Authorization") String authHeader,
                                       @RequestBody(required = false) Map<String, String> payload) {
        try {
            String token = authHeader.substring(7);
            User currentUser = userService.getUserProfile(token);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid or expired token."));
            }
            String passkey = (payload != null) ? payload.get("passkey") : null;
            groupService.joinGroup(groupId, currentUser, passkey);
            return ResponseEntity.ok(Map.of("message", "Successfully joined group."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "An error occurred while joining the group: " + e.getMessage()));
        }
    }
}

