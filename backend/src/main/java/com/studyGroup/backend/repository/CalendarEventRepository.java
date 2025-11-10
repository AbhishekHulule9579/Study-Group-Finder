package com.studyGroup.backend.repository;

import com.studyGroup.backend.model.CalendarEvent;
import com.studyGroup.backend.model.Group;
import com.studyGroup.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {

    List<CalendarEvent> findByAssociatedGroup(Group group);

    List<CalendarEvent> findByCreatedBy(User user);

    List<CalendarEvent> findByAssociatedGroupAndStatus(Group group, CalendarEvent.EventStatus status);

    List<CalendarEvent> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);

    List<CalendarEvent> findByStartTimeGreaterThanEqual(LocalDateTime startTime);

    List<CalendarEvent> findByAssociatedGroupInAndStartTimeAfter(List<Group> groups, LocalDateTime startTime);

    List<CalendarEvent> findByAssociatedGroupIn(List<Group> groups);

    List<CalendarEvent> findByAssociatedGroupAndStartTimeBetween(Group group, LocalDateTime start, LocalDateTime end);
}
