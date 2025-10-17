package com.studyGroup.infosys.service;

import com.studyGroup.infosys.dto.NotificationDTO;
import com.studyGroup.infosys.model.Notification;
import com.studyGroup.infosys.model.User;
import com.studyGroup.infosys.repository.NotificationRepository;
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

    /**
     * Creates a notification, saves it to the database, and sends it to the user via WebSocket.
     * This version accepts a URL to make notifications clickable.
     */
    public Notification createNotification(User user, String message, String url) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setLink(url); // Set the link for the notification
        notification.setRead(false);
        notification.setTimestamp(LocalDateTime.now());
        Notification savedNotification = notificationRepository.save(notification);

        // Send a real-time notification to the user's personal queue
        messagingTemplate.convertAndSendToUser(
                user.getEmail(),
                "/queue/notifications",
                convertToDTO(savedNotification)
        );

        return savedNotification;
    }

    /**
     * Retrieves all notifications for a specific user, ordered by the most recent.
     */
    public List<NotificationDTO> getNotificationsForUser(User user) {
        return notificationRepository.findByUserOrderByTimestampDesc(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Counts the number of unread notifications for a user.
     */
    public long getUnreadNotificationCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    /**
     * Marks a specific notification as read.
     */
    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

        // Ensure the user is authorized to modify this notification
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new SecurityException("User not authorized to read this notification");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    /**
     * Converts a Notification entity to its DTO representation.
     */
    private NotificationDTO convertToDTO(Notification notification) {
        return new NotificationDTO(
                notification.getId(),
                notification.getMessage(),
                notification.getLink(),
                notification.isRead(),
                notification.getTimestamp()
        );
    }
}

