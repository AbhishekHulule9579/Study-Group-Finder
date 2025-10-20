package com.studyGroup.infosys.controller;

import com.studyGroup.infosys.dto.*;
import com.studyGroup.infosys.model.User;
import com.studyGroup.infosys.repository.GroupRepository;
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

    @Autowired
    private GroupRepository groupRepository;

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

    /**
     * Retrieves the details of a specific group.
     */
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

    /**
     * Retrieves the member list for a specific group.
     */
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

    /**
     * Creates a new group.
     */
    @PostMapping("/create")
    public ResponseEntity<?> createGroup(@RequestBody CreateGroupRequest createGroupRequest,
                                         @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            User currentUser = userService.getUserProfile(token);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
            }

            GroupDTO newGroup = groupService.createGroup(createGroupRequest, currentUser);
            return ResponseEntity.ok(newGroup);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while creating the group: " + e.getMessage());
        }
    }

    /**
     * Retrieves the groups that the current user is part of.
     */
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while fetching your groups: " + e.getMessage());
        }
    }

    /**
     * Retrieves all available groups.
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllGroups() {
        try {
            List<GroupDTO> allGroups = groupService.getAllGroups();
            return ResponseEntity.ok(allGroups);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while fetching all groups: " + e.getMessage());
        }
    }

    /**
     * Handles joining a group (public or private via passkey).
     */
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
     */
    @GetMapping("/{groupId}/requests")
    public ResponseEntity<?> getGroupJoinRequests(@PathVariable Long groupId,
                                                  @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            User currentUser = userService.getUserProfile(token);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
            }

            List<GroupJoinRequestDTO> requests = groupService.getJoinRequests(groupId, currentUser);
            return ResponseEntity.ok(requests);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Updates group name and description.
     */
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

    /**
     * Handles group join requests (accept/reject).
     */
    @PostMapping("/requests/handle")
    public ResponseEntity<?> handleJoinRequest(@RequestBody JoinRequestDTO joinRequest,
                                               @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            User currentUser = userService.getUserProfile(token);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
            }

            groupService.handleJoinRequest(joinRequest.getRequestId(), joinRequest.getStatus(), currentUser);
            return ResponseEntity.ok(Map.of("message", "Request handled successfully."));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
