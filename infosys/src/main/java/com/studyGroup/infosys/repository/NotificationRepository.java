package com.studyGroup.infosys.repository;

import com.studyGroup.infosys.model.Notification;
import com.studyGroup.infosys.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByTimestampDesc(User user);
    long countByUserAndIsReadFalse(User user);
}
