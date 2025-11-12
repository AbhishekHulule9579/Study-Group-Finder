package com.studyGroup.backend.service;

import com.studyGroup.backend.dto.NotificationDTO;
import com.studyGroup.backend.model.Notification;
import com.studyGroup.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

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

    public void markAsRead(Integer notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(Integer userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
        for (Notification notification : notifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(notifications);
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
