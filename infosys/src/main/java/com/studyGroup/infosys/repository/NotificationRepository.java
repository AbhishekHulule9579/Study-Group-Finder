package com.studyGroup.infosys.repository;

import com.studyGroup.infosys.model.Notification;
import com.studyGroup.infosys.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Finds all notifications for a user, ordered with the newest first.
     */
    List<Notification> findByUserOrderByTimestampDesc(User user);

    /**
     * Counts how many notifications for a given user have not been read yet.
     */
    long countByUserAndIsReadFalse(User user);
    
    /**
     * Finds all unread notifications for a user, ordered with the newest first.
     * Useful for displaying a feed of only unread items.
     */
    List<Notification> findByUserAndIsReadIsFalseOrderByTimestampDesc(User user);
}

