package com.studyGroup.infosys.controller;

import com.studyGroup.infosys.dto.NotificationDTO;
import com.studyGroup.infosys.model.User;
import com.studyGroup.infosys.service.NotificationService;
import com.studyGroup.infosys.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    /**
     * A helper method to securely retrieve the User object from the Principal.
     * Throws a runtime exception if the user is not found, which should not happen in a secured context.
     */
    private User getUserByPrincipal(Principal principal) {
        return userService.getUserByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found with email: " + principal.getName()));
    }

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications(Principal principal) {
        User user = getUserByPrincipal(principal);
        return ResponseEntity.ok(notificationService.getNotificationsForUser(user));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getUnreadNotificationCount(Principal principal) {
        User user = getUserByPrincipal(principal);
        return ResponseEntity.ok(notificationService.getUnreadNotificationCount(user));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, Principal principal) {
        User user = getUserByPrincipal(principal);
        notificationService.markAsRead(id, user);
        return ResponseEntity.ok().build();
    }
}

