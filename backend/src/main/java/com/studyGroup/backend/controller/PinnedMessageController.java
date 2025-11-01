package com.studyGroup.backend.controller;

import com.studyGroup.backend.model.PinnedMessage;
import com.studyGroup.backend.service.PinnedMessageService;
import com.studyGroup.backend.service.JWTService;
import com.studyGroup.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/pins")
@CrossOrigin(origins = "http://localhost:5173")
public class PinnedMessageController {

    @Autowired
    private PinnedMessageService pinnedMessageService;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private UserService userService;

    @PostMapping("/messages/{messageId}")
    public ResponseEntity<?> pinMessage(
            @PathVariable Long groupId,
            @PathVariable Long messageId,
            @RequestHeader("Authorization") String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        String email = jwtService.validateToken(token);
        if ("401".equals(email)) {
            return ResponseEntity.status(401).body("Invalid/expired token");
        }

        var userOpt = userService.getUserByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        Integer userId = userOpt.get().getId();
        try {
            PinnedMessage pinnedMessage = pinnedMessageService.pinMessage(groupId, messageId, userId);
            return ResponseEntity.ok(pinnedMessage);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<?> unpinMessage(
            @PathVariable Long groupId,
            @PathVariable Long messageId,
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        String email = jwtService.validateToken(token);
        if ("401".equals(email)) {
            return ResponseEntity.status(401).body("Invalid/expired token");
        }

        try {
            pinnedMessageService.unpinMessage(groupId, messageId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<PinnedMessage>> getPinnedMessages(
            @PathVariable Long groupId,
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authHeader.substring(7);
        String email = jwtService.validateToken(token);
        if ("401".equals(email)) {
            return ResponseEntity.status(401).build();
        }

        List<PinnedMessage> pinnedMessages = pinnedMessageService.getPinnedMessages(groupId);
        return ResponseEntity.ok(pinnedMessages);
    }
}