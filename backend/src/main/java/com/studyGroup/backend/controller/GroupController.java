package com.studyGroup.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.studyGroup.backend.dto.*;
import com.studyGroup.backend.model.User;
import com.studyGroup.backend.repository.GroupRepository;
import com.studyGroup.backend.service.GroupService;
import com.studyGroup.backend.service.UserService;

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

    @Autowired
    private GroupRepository groupRepository;

    // --- Existing Endpoints (Logic maintained) ---

    @DeleteMapping("/leave/{groupId}")
    public ResponseEntity<?> leaveGroup(@PathVariable Long groupId, @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            User currentUser = userService.getUserProfile(token);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid or expired token."));
            }

            String resultMessage = groupService.leaveGroup(groupId, currentUser);
            return ResponseEntity.ok(Map.of("message", resultMessage));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred while leaving the group: " + e.getMessage()));
        }
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<?> getGroupDetails(@PathVariable Long groupId, @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            User currentUser = userService.getUserProfile(token);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid or expired token."));
            }

            GroupDTO groupDetails = groupService.getGroupDetails(groupId, currentUser);
            return ResponseEntity.ok(groupDetails);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred while fetching group details: " + e.getMessage()));
        }
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<?> getGroupMembers(@PathVariable Long groupId, @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            User currentUser = userService.getUserProfile(token);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid or expired token."));
            }

            List<UserSummaryDTO> members = groupService.getGroupMembers(groupId, currentUser);
            return ResponseEntity.ok(members);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred while fetching group members: " + e.getMessage()));
        }
    }
    
    @PostMapping("/create")
    public ResponseEntity<?> createGroup(@RequestBody CreateGroupRequest createGroupRequest,
                                         @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            User currentUser = userService.getUserProfile(token);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid or expired token."));
            }

            GroupDTO newGroup = groupService.createGroup(createGroupRequest, currentUser);
            return ResponseEntity.ok(newGroup);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred while creating the group: " + e.getMessage()));
        }
    }
    
    @GetMapping("/my-groups")
    public ResponseEntity<?> getMyGroups(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            User currentUser = userService.getUserProfile(token);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid or expired token."));
            }

            List<GroupDTO> myGroups = groupService.findGroupsByUserId(currentUser.getId());
            return ResponseEntity.ok(myGroups);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred while fetching your groups: " + e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllGroups() {
        try {
            List<GroupDTO> allGroups = groupService.getAllGroups();
            return ResponseEntity.ok(allGroups);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred while fetching all groups: " + e.getMessage()));
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
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid or expired token."));
            }

            String passkey = (payload != null) ? payload.get("passkey") : null;
            groupService.joinGroup(groupId, currentUser, passkey);

            String message = "Your request to join the group has been sent.";
            boolean isPublic = groupRepository.findById(groupId)
                    .map(g -> "public".equalsIgnoreCase(g.getPrivacy()))
                    .orElse(false);

            if (passkey != null || isPublic) {
                message = "Successfully joined group.";
            }

            return ResponseEntity.ok(Map.of("message", message));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred while joining the group: " + e.getMessage()));
        }
    }

    /**
     * Retrieves join requests for a specific group.
     * 🚩 CORRECTION: Wraps the list in a map under the key "requests" as expected by frontend.
     */
    @GetMapping("/{groupId}/requests")
    public ResponseEntity<?> getGroupJoinRequests(@PathVariable Long groupId,
                                                    @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            User currentUser = userService.getUserProfile(token);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid or expired token."));
            }

            List<GroupJoinRequestDTO> requests = groupService.getJoinRequests(groupId, currentUser);
            return ResponseEntity.ok(Map.of("requests", requests));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred: " + e.getMessage()));
        }
    }

    @PutMapping("/{groupId}")
    public ResponseEntity<?> updateGroupDetails(@PathVariable Long groupId,
                                                    @RequestBody GroupDTO groupDetails,
                                                    @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            User currentUser = userService.getUserProfile(token);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid or expired token."));
            }

            GroupDTO updatedGroup = groupService.updateGroup(groupId, groupDetails, currentUser);
            return ResponseEntity.ok(updatedGroup);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred while updating group details: " + e.getMessage()));
        }
    }

    // ----------------------------------------------------------------------
    // 🚩 NEW RESTful Endpoint: Handles Group Join Request (Approve/Deny)
    // Replaces the old @PostMapping("/requests/handle")
    // ----------------------------------------------------------------------
    @PutMapping("/{groupId}/requests/{requestId}")
    public ResponseEntity<?> handleJoinRequest(@PathVariable Long groupId,
                                               @PathVariable Long requestId,
                                               @RequestBody Map<String, String> payload, // Expects { "action": "APPROVED" | "DENIED" }
                                               @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            User currentUser = userService.getUserProfile(token);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid or expired token."));
            }

            String status = payload.get("action");
            if (status == null || (!"APPROVED".equalsIgnoreCase(status) && !"DENIED".equalsIgnoreCase(status))) {
                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid action status provided. Must be APPROVED or DENIED."));
            }

            groupService.handleJoinRequest(groupId, requestId, status, currentUser);
            return ResponseEntity.ok(Map.of("message", "Request handled successfully."));

        } catch (RuntimeException e) {
            HttpStatus status = e.getMessage().contains("authorized") ? HttpStatus.FORBIDDEN :
                                e.getMessage().contains("not found") ? HttpStatus.NOT_FOUND :
                                HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred: " + e.getMessage()));
        }
    }
    
    // ----------------------------------------------------------------------
    // 🚩 NEW RESTful Endpoint: Remove Member (DELETE /{groupId}/members/{memberId})
    // ----------------------------------------------------------------------
    @DeleteMapping("/{groupId}/members/{memberId}")
    public ResponseEntity<?> removeGroupMember(@PathVariable Long groupId, 
                                                @PathVariable Long memberId,
                                                @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            User currentUser = userService.getUserProfile(token);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid or expired token."));
            }

            groupService.removeMember(groupId, memberId, currentUser);
            return ResponseEntity.ok(Map.of("message", "Member removed successfully."));
            
        } catch (RuntimeException e) {
            HttpStatus status = e.getMessage().contains("authorized") ? HttpStatus.FORBIDDEN : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred during member removal: " + e.getMessage()));
        }
    }
    
    // ----------------------------------------------------------------------
    // 🚩 NEW RESTful Endpoint: Change Member Role (PUT /{groupId}/members/{memberId}/role)
    // ----------------------------------------------------------------------
    @PutMapping("/{groupId}/members/{memberId}/role")
    public ResponseEntity<?> changeMemberRole(@PathVariable Long groupId, 
                                                @PathVariable Long memberId,
                                                @RequestBody Map<String, String> payload, // Expects { "role": "Admin" | "Member" }
                                                @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            User currentUser = userService.getUserProfile(token);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid or expired token."));
            }
            
            String newRole = payload.get("role");
            if (newRole == null || (!"Admin".equalsIgnoreCase(newRole) && !"Member".equalsIgnoreCase(newRole))) {
                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid role provided. Must be Admin or Member."));
            }

            groupService.changeMemberRole(groupId, memberId, newRole, currentUser);
            return ResponseEntity.ok(Map.of("message", "Member role updated successfully."));
            
        } catch (RuntimeException e) {
            HttpStatus status = e.getMessage().contains("authorized") ? HttpStatus.FORBIDDEN : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred during role update: " + e.getMessage()));
        }
    }
}