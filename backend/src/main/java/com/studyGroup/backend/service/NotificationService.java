package com.studyGroup.backend.service;

import com.studyGroup.backend.dto.NotificationDTO;
import com.studyGroup.backend.model.Notification;
import com.studyGroup.backend.model.User;
import com.studyGroup.backend.repository.NotificationRepository;
import com.studyGroup.backend.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public NotificationDTO createNotification(Integer userId, String message, String type) {
        return createNotification(userId, null, message, type, null, null);
    }

    public NotificationDTO createNotification(Integer userId, String title, String message, String type,
                                              Long relatedEntityId, String relatedEntityType) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRelatedEntityId(relatedEntityId);
        notification.setRelatedEntityType(relatedEntityType);

        Notification savedNotification = notificationRepository.save(notification);
        NotificationDTO dto = convertToDTO(savedNotification);

        // Publish real-time notification to user-specific destination
        messagingTemplate.convertAndSend("/queue/notifications/" + userId, dto);

        return dto;
    }

    // Convenience helpers for common types
    public NotificationDTO createInviteNotification(Integer userId, String title, String message,
                                                    Long relatedEntityId, String relatedEntityType) {
        return createNotification(userId, title, message, "Invites", relatedEntityId, relatedEntityType);
    }

    public NotificationDTO createReminderNotification(Integer userId, String title, String message,
                                                      Long relatedEntityId, String relatedEntityType) {
        return createNotification(userId, title, message, "Reminders", relatedEntityId, relatedEntityType);
    }

    public NotificationDTO createUpdateNotification(Integer userId, String title, String message,
                                                    Long relatedEntityId, String relatedEntityType) {
        return createNotification(userId, title, message, "Updates", relatedEntityId, relatedEntityType);
    }

    public List<NotificationDTO> getNotificationsByUserId(Integer userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return notifications.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnreadNotificationsByUserId(Integer userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
        return notifications.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Integer notificationId) {
        Integer authenticatedUserId = getAuthenticatedUserId();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!authenticatedUserId.equals(notification.getUserId())) {
            throw new RuntimeException("Unauthorized: Cannot mark notification as read for another user");
        }
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Integer userId) {
        Integer authenticatedUserId = getAuthenticatedUserId();
        if (!authenticatedUserId.equals(userId)) {
            throw new RuntimeException("Unauthorized: Cannot modify notifications for another user");
        }
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
        for (Notification notification : notifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public void deleteAllReadNotifications(Integer userId) {
        Integer authenticatedUserId = getAuthenticatedUserId();
        if (!authenticatedUserId.equals(userId)) {
            throw new RuntimeException("Unauthorized: Cannot delete notifications for another user");
        }
        notificationRepository.deleteByUserIdAndIsRead(userId, true);
    }

    @Transactional
    public void deleteNotifications(List<Integer> notificationIds) {
        Integer authenticatedUserId = getAuthenticatedUserId();
        // Verify that all notifications belong to the authenticated user
        List<Notification> notifications = notificationRepository.findAllById(notificationIds);
        for (Notification notification : notifications) {
            if (!authenticatedUserId.equals(notification.getUserId())) {
                throw new RuntimeException("Unauthorized: Cannot delete notifications that don't belong to you");
            }
        }
        notificationRepository.deleteAllByIdIn(notificationIds);
    }

    private Integer getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        String email = authentication.getName();
        User user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    private NotificationDTO convertToDTO(Notification notification) {
        return new NotificationDTO(
                notification.getId(),
                notification.getUserId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getIsRead(),
                notification.getCreatedAt(),
                notification.getRelatedEntityId(),
                notification.getRelatedEntityType()
        );
    }
}
