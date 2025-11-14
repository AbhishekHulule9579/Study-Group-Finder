package com.studyGroup.backend.repository;

import com.studyGroup.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Integer userId);

    List<Notification> findByUserIdAndIsReadOrderByCreatedAtDesc(Integer userId, Boolean isRead);

    void deleteByUserIdAndIsRead(Integer userId, Boolean isRead);

    void deleteAllByIdIn(List<Integer> ids);
}
