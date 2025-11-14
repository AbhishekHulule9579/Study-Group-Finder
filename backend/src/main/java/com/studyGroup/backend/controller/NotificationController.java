package com.studyGroup.backend.controller;

import com.studyGroup.backend.dto.NotificationDTO;
import com.studyGroup.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/create")
    public ResponseEntity<NotificationDTO> createNotification(@RequestParam Integer userId, @RequestParam String message, @RequestParam String type) {
        NotificationDTO notification = notificationService.createNotification(userId, message, type);
        return ResponseEntity.ok(notification);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> getNotifications(@PathVariable Integer userId) {
        List<NotificationDTO> notifications = notificationService.getNotificationsByUserId(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@PathVariable Integer userId) {
        List<NotificationDTO> notifications = notificationService.getUnreadNotificationsByUserId(userId);
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Integer id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Integer userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/user/{userId}/read")
    public ResponseEntity<Void> deleteAllReadNotifications(@PathVariable Integer userId) {
        notificationService.deleteAllReadNotifications(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/selected")
    public ResponseEntity<Void> deleteSelectedNotifications(@RequestBody List<Integer> notificationIds) {
        notificationService.deleteNotifications(notificationIds);
        return ResponseEntity.noContent().build();
    }
}
