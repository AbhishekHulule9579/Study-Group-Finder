package com.studyGroup.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.studyGroup.backend.dto.CalendarEventDTO;
import com.studyGroup.backend.dto.UserSummaryDTO;
import com.studyGroup.backend.model.CalendarEvent;
import com.studyGroup.backend.model.Group;
import com.studyGroup.backend.model.User;
import com.studyGroup.backend.repository.CalendarEventRepository;
import com.studyGroup.backend.repository.GroupRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CalendarEventService {

    @Autowired
    private CalendarEventRepository calendarEventRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupService groupService;

    private CalendarEventDTO convertToDTO(CalendarEvent event) {
        User creator = event.getCreatedBy();
        UserSummaryDTO creatorDTO = new UserSummaryDTO(
                Long.valueOf(creator.getId()),
                creator.getName(),
                creator.getEmail(),
                null, // aboutMe not needed here
                "Creator"
        );

        return new CalendarEventDTO(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getStartTime(),
                event.getEndTime(),
                event.getLocation(),
                event.getMeetingLink(),
                event.getAssociatedGroup().getGroupId(),
                creatorDTO,
                event.getStatus().name()
        );
    }

    public CalendarEventDTO createEvent(CalendarEventDTO eventDTO, User user) {
        Group group = groupRepository.findById(eventDTO.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + eventDTO.getGroupId()));

        String userRole = groupService.getUserRoleInGroup(eventDTO.getGroupId(), user);
        if ("non-member".equals(userRole)) {
            throw new RuntimeException("You must be a member of the group to create events.");
        }

        CalendarEvent event = new CalendarEvent();
        event.setTitle(eventDTO.getTitle());
        event.setDescription(eventDTO.getDescription());
        event.setStartTime(eventDTO.getStartTime());
        event.setEndTime(eventDTO.getEndTime());
        event.setLocation(eventDTO.getLocation());
        event.setMeetingLink(eventDTO.getMeetingLink());
        event.setAssociatedGroup(group);
        event.setCreatedBy(user);
        event.setStatus(CalendarEvent.EventStatus.valueOf(eventDTO.getStatus().toUpperCase()));

        CalendarEvent savedEvent = calendarEventRepository.save(event);
        return convertToDTO(savedEvent);
    }

    public CalendarEventDTO getEventById(Long id, User user) {
        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));

        String userRole = groupService.getUserRoleInGroup(event.getAssociatedGroup().getGroupId(), user);
        if ("non-member".equals(userRole)) {
            throw new RuntimeException("You must be a member of the group to view this event.");
        }

        return convertToDTO(event);
    }

    public List<CalendarEventDTO> getEventsByGroup(Long groupId, User user) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));

        String userRole = groupService.getUserRoleInGroup(groupId, user);
        if ("non-member".equals(userRole)) {
            throw new RuntimeException("You must be a member of the group to view events.");
        }

        List<CalendarEvent> events = calendarEventRepository.findByAssociatedGroup(group);
        return events.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CalendarEventDTO updateEvent(Long id, CalendarEventDTO eventDTO, User user) {
        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));

        boolean isCreator = event.getCreatedBy().getId().equals(user.getId());
        String userRole = groupService.getUserRoleInGroup(event.getAssociatedGroup().getGroupId(), user);
        boolean isAdmin = "Admin".equalsIgnoreCase(userRole);

        if (!isCreator && !isAdmin) {
            throw new RuntimeException("You are not authorized to update this event.");
        }

        event.setTitle(eventDTO.getTitle());
        event.setDescription(eventDTO.getDescription());
        event.setStartTime(eventDTO.getStartTime());
        event.setEndTime(eventDTO.getEndTime());
        event.setLocation(eventDTO.getLocation());
        event.setMeetingLink(eventDTO.getMeetingLink());
        event.setStatus(CalendarEvent.EventStatus.valueOf(eventDTO.getStatus().toUpperCase()));

        CalendarEvent updatedEvent = calendarEventRepository.save(event);
        return convertToDTO(updatedEvent);
    }

    public void deleteEvent(Long id, User user) {
        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));

        boolean isCreator = event.getCreatedBy().getId().equals(user.getId());
        String userRole = groupService.getUserRoleInGroup(event.getAssociatedGroup().getGroupId(), user);
        boolean isAdmin = "Admin".equalsIgnoreCase(userRole);

        if (!isCreator && !isAdmin) {
            throw new RuntimeException("You are not authorized to delete this event.");
        }

        calendarEventRepository.delete(event);
    }

    public List<CalendarEventDTO> getEventsByUser(User user) {
        List<CalendarEvent> events = calendarEventRepository.findByCreatedBy(user);
        // Filter to only include events from groups the user is a member of
        return events.stream()
                .filter(event -> {
                    String userRole = groupService.getUserRoleInGroup(event.getAssociatedGroup().getGroupId(), user);
                    return !"non-member".equals(userRole);
                })
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CalendarEventDTO> getEventsByStatus(Long groupId, String status, User user) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));

        String userRole = groupService.getUserRoleInGroup(groupId, user);
        if ("non-member".equals(userRole)) {
            throw new RuntimeException("You must be a member of the group to view events.");
        }

        CalendarEvent.EventStatus eventStatus;
        try {
            eventStatus = CalendarEvent.EventStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status);
        }

        List<CalendarEvent> events = calendarEventRepository.findByAssociatedGroupAndStatus(group, eventStatus);
        return events.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CalendarEventDTO> getEventsByDateRange(Long groupId, LocalDateTime start, LocalDateTime end, User user) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));

        String userRole = groupService.getUserRoleInGroup(groupId, user);
        if ("non-member".equals(userRole)) {
            throw new RuntimeException("You must be a member of the group to view events.");
        }

        List<CalendarEvent> events = calendarEventRepository.findByStartTimeBetween(start, end);
        // Filter to only this group
        return events.stream()
                .filter(event -> event.getAssociatedGroup().getGroupId().equals(groupId))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}
