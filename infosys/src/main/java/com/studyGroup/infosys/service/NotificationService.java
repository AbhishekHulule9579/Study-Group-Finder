package com.studyGroup.infosys.service;

import com.studyGroup.infosys.dto.NotificationDTO;
import com.studyGroup.infosys.model.Notification;
import com.studyGroup.infosys.model.User;
import com.studyGroup.infosys.repository.NotificationRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void createNotification(User user, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setRead(false);
        notificationRepository.save(notification);
    }

    public List<NotificationDTO> getNotificationsForUser(User user) {
        return notificationRepository.findByUserOrderByTimestampDesc(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public long getUnreadNotificationCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getUser().equals(user)) {
            throw new SecurityException("User not authorized to read this notification");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setMessage(notification.getMessage());
        dto.setRead(notification.isRead());
        dto.setTimestamp(notification.getTimestamp());
        return dto;
    }
}
