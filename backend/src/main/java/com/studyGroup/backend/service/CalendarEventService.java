package com.studyGroup.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // ✅ Added this import

import com.studyGroup.backend.dto.CalendarEventDTO;
import com.studyGroup.backend.dto.UserSummaryDTO;
import com.studyGroup.backend.model.CalendarEvent;
import com.studyGroup.backend.model.Group;
import com.studyGroup.backend.model.GroupMember;
import com.studyGroup.backend.model.User;
import com.studyGroup.backend.repository.CalendarEventRepository;
import com.studyGroup.backend.repository.GroupMemberRepository;
import com.studyGroup.backend.repository.GroupRepository;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Scheduled;

@Service
public class CalendarEventService {

    // === Time/format helpers ===
    private static final ZoneId UTC = ZoneId.of("UTC");
    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");
    private static final DateTimeFormatter DATE_DDMMYYYY = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_HH_MM_A = DateTimeFormatter.ofPattern("hh:mm a");

    private static ZonedDateTime toIST(LocalDateTime utcDateTime) {
        return utcDateTime.atZone(UTC).withZoneSameInstant(IST);
    }

    private static String formatDateIST(LocalDateTime utcDateTime) {
        return toIST(utcDateTime).format(DATE_DDMMYYYY);
    }

    private static String formatTimeRangeIST(LocalDateTime startUtc, LocalDateTime endUtc) {
        return toIST(startUtc).format(TIME_HH_MM_A) + " - " + toIST(endUtc).format(TIME_HH_MM_A);
    }

    @Autowired
    private CalendarEventRepository calendarEventRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupService groupService;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    private CalendarEventDTO convertToDTO(CalendarEvent event) {
        User creator = event.getCreatedBy();
        UserSummaryDTO creatorDTO = new UserSummaryDTO(
                Long.valueOf(creator.getId()),
                creator.getName(),
                creator.getEmail(),
                null,
                "Creator"
        );

        return new CalendarEventDTO(
                event.getId(),
                event.getTopic(),
                event.getDescription(),
                event.getStartTime(),
                event.getEndTime(),
                event.getLocation(),
                event.getMeetingLink(),
                event.getOrganizerName(),
                event.getSessionType().name(),
                event.getPasscode(),
                event.getAssociatedGroup().getGroupId(),
                event.getAssociatedGroup().getName(),
                event.getAssociatedGroup().getAssociatedCourse().getCourseName(),
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
        event.setTopic(eventDTO.getTopic());
        event.setDescription(eventDTO.getDescription());
        event.setStartTime(eventDTO.getStartTime());
        event.setEndTime(eventDTO.getEndTime());
        event.setLocation(eventDTO.getLocation());
        event.setMeetingLink(eventDTO.getMeetingLink());
        event.setOrganizerName(eventDTO.getOrganizerName());
        event.setSessionType(CalendarEvent.SessionType.valueOf(eventDTO.getSessionType().toUpperCase()));
        event.setPasscode(eventDTO.getPasscode());
        event.setAssociatedGroup(group);
        event.setCreatedBy(user);
        event.setStatus(CalendarEvent.EventStatus.valueOf(eventDTO.getStatus().toUpperCase()));
        event.setCreatedAt(LocalDateTime.now());
        event.setReminderSent(false);
        event.setReminder10MinSent(false);
        event.setReminder1MinSent(false);
        event.setReminder1HourSent(false);

        CalendarEvent savedEvent = calendarEventRepository.save(event);

        // Send emails (existing behavior)
        sendEventCreationEmail(savedEvent, user);

        // In-app notifications for creator and all group members
        List<GroupMember> members = groupMemberRepository.findByGroup(savedEvent.getAssociatedGroup());
        String groupName = savedEvent.getAssociatedGroup().getName();
        String topic = savedEvent.getTopic();
        Long eventId = savedEvent.getId();
        String creatorName = user.getName();

        // Creator
        notificationService.createUpdateNotification(
                user.getId(),
                "New session created",
                "You created '" + topic + "' in '" + groupName + "'.",
                eventId,
                "CALENDAR_EVENT"
        );
        // Other members
        for (GroupMember gm : members) {
            Integer memberId = gm.getUser().getId();
            if (!memberId.equals(user.getId())) {
                notificationService.createUpdateNotification(
                        memberId,
                        "New session created",
                        creatorName + " created '" + topic + "' in '" + groupName + "'.",
                        eventId,
                        "CALENDAR_EVENT"
                );
            }
        }

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
        return events.stream().map(this::convertToDTO).collect(Collectors.toList());
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

        LocalDateTime oldStart = event.getStartTime();

        event.setTopic(eventDTO.getTopic());
        event.setDescription(eventDTO.getDescription());
        event.setStartTime(eventDTO.getStartTime());
        event.setEndTime(eventDTO.getEndTime());
        event.setLocation(eventDTO.getLocation());
        event.setMeetingLink(eventDTO.getMeetingLink());
        event.setOrganizerName(eventDTO.getOrganizerName());
        event.setSessionType(CalendarEvent.SessionType.valueOf(eventDTO.getSessionType().toUpperCase()));
        event.setPasscode(eventDTO.getPasscode());
        event.setStatus(CalendarEvent.EventStatus.valueOf(eventDTO.getStatus().toUpperCase()));

        if (!Objects.equals(oldStart, event.getStartTime())) {
            event.setReminderSent(false);
            event.setReminder10MinSent(false);
            event.setReminder1MinSent(false);
            event.setReminder1HourSent(false);
        }

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

        sendEventCancellationEmail(event, user);

        // In-app cancellation update for all members
        List<GroupMember> members = groupMemberRepository.findByGroup(event.getAssociatedGroup());
        for (GroupMember gm : members) {
            notificationService.createUpdateNotification(
                    gm.getUser().getId(),
                    "Session canceled",
                    "Update: '" + event.getTopic() + "' has been canceled in '" + event.getAssociatedGroup().getName() + "'.",
                    event.getId(),
                    "CALENDAR_EVENT"
            );
        }

        calendarEventRepository.delete(event);
    }

    // ==== Email helpers ====

    private void appendCommonEventLines(StringBuilder body, CalendarEvent event) {
        body.append("Event Details:\n");
        body.append("Session Name: ").append(event.getTopic()).append("\n");
        body.append("Organizer: ").append(
                event.getOrganizerName() != null ? event.getOrganizerName() : "N/A"
        ).append("\n");
        body.append("Associated Course: ").append(
                event.getAssociatedGroup().getAssociatedCourse().getCourseName()
        ).append("\n");
        body.append("Associated Group: ").append(
                event.getAssociatedGroup().getName()
        ).append("\n");

        body.append("Date: ").append(formatDateIST(event.getStartTime())).append("\n");
        body.append("Time: ").append(formatTimeRangeIST(event.getStartTime(), event.getEndTime())).append("\n");

        if (event.getMeetingLink() != null && !event.getMeetingLink().isEmpty()) {
            body.append("Meeting Link: ").append(event.getMeetingLink()).append("\n");
        }
        if (event.getSessionType() == CalendarEvent.SessionType.OFFLINE
                || event.getSessionType() == CalendarEvent.SessionType.HYBRID) {
            if (event.getLocation() != null && !event.getLocation().isEmpty()) {
                body.append("Location: ").append(event.getLocation()).append("\n");
            }
        }

        body.append("\nDescription: ")
                .append(event.getDescription() != null ? event.getDescription() : "No description provided.")
                .append("\n\n");
        body.append("Best regards,\nStudy Group Finder Team");
    }

    private void sendEventCreationEmail(CalendarEvent event, User creator) {
        List<GroupMember> members = groupMemberRepository.findByGroup(event.getAssociatedGroup());
        String subject = "New Event Created: " + event.getTopic();
        for (GroupMember member : members) {
            StringBuilder body = new StringBuilder();
            body.append("Dear Group Member,\n\n");
            body.append("A new event has been created in your group.\n\n");
            body.append("Creator: ").append(creator.getName()).append("\n");
            appendCommonEventLines(body, event);
            emailService.sendEmail(member.getUser().getEmail(), subject, body.toString());
        }
    }

    private void sendEventCancellationEmail(CalendarEvent event, User canceller) {
        List<GroupMember> members = groupMemberRepository.findByGroup(event.getAssociatedGroup());
        String subject = "Event Cancelled: " + event.getTopic();
        for (GroupMember member : members) {
            StringBuilder body = new StringBuilder();
            body.append("Dear Group Member,\n\n");
            body.append("An event has been cancelled in your group.\n\n");
            body.append("Cancelled By: ").append(canceller.getName()).append("\n");
            appendCommonEventLines(body, event);
            emailService.sendEmail(member.getUser().getEmail(), subject, body.toString());
        }
    }

    // ✅ FIXED: Added @Transactional to prevent LazyInitializationException
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void sendReminderEmails() {
        LocalDateTime nowUtc = ZonedDateTime.now(UTC).toLocalDateTime();
        LocalDateTime tenMinutesLaterUtc = nowUtc.plusMinutes(10);
        LocalDateTime oneHourLaterUtc = nowUtc.plusHours(1);

        // Fetch events starting within 1 hour
        List<CalendarEvent> upcomingEvents =
                calendarEventRepository.findByStartTimeBetween(nowUtc, oneHourLaterUtc);

        for (CalendarEvent event : upcomingEvents) {
            LocalDateTime createdAt = event.getCreatedAt();
            if (createdAt == null) continue; // Skip if no createdAt (legacy events)

            long minutesSinceCreation = java.time.Duration.between(createdAt, nowUtc).toMinutes();

            // Determine which reminder to send based on creation time
            if (minutesSinceCreation < 60) { // Created less than 1 hour ago
                if (minutesSinceCreation < 10) { // Created less than 10 minutes ago
                    if (Boolean.TRUE.equals(event.getReminder1MinSent())) continue;
                    sendReminderEmail(event, "1 minute");
                    event.setReminder1MinSent(true);
                } else {
                    if (Boolean.TRUE.equals(event.getReminder10MinSent())) continue;
                    sendReminderEmail(event, "10 minutes");
                    event.setReminder10MinSent(true);
                }
            } else { // Created 1 hour or more ago
                if (Boolean.TRUE.equals(event.getReminder1HourSent())) continue;
                sendReminderEmail(event, "1 hour");
                event.setReminder1HourSent(true);
            }

            calendarEventRepository.save(event);
        }
    }

    private void sendReminderEmail(CalendarEvent event, String timeFrame) {
        List<GroupMember> members = groupMemberRepository.findByGroup(event.getAssociatedGroup());
        String subject = "Reminder: Event Starting in " + timeFrame + " - " + event.getTopic();
        StringBuilder base = new StringBuilder();
        base.append("Dear Group Member,\n\n");
        base.append("This is a reminder that an event in your group is starting in less than ").append(timeFrame).append(".\n\n");
        appendCommonEventLines(base, event);
        String body = base.toString();

        for (GroupMember member : members) {
            emailService.sendEmail(member.getUser().getEmail(), subject, body);
            // In-app reminder notification
            notificationService.createReminderNotification(
                    member.getUser().getId(),
                    "Upcoming session reminder",
                    "Reminder: '" + event.getTopic() + "' starts at " + formatTimeRangeIST(event.getStartTime(), event.getEndTime()) + " in '" + event.getAssociatedGroup().getName() + "'.",
                    event.getId(),
                    "CALENDAR_EVENT"
            );
        }

        System.out.println("[Reminder] " + timeFrame + " email sent for event: " + event.getTopic());
    }

    public List<CalendarEventDTO> getUpcomingEventsForUser(User user) {
        LocalDateTime now = LocalDateTime.now();
        List<GroupMember> memberships = groupMemberRepository.findByUser(user);
        
        if (memberships.isEmpty()) {
            return List.of();
        }
        
        List<CalendarEvent> upcomingEvents = calendarEventRepository.findByAssociatedGroupInAndStartTimeAfter(
                memberships.stream().map(GroupMember::getGroup).collect(Collectors.toList()), now);
        
        return upcomingEvents.stream()
                .sorted((e1, e2) -> e1.getStartTime().compareTo(e2.getStartTime()))
                .limit(1)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CalendarEventDTO> getAllUpcomingEventsForUser(User user) {
        LocalDateTime now = LocalDateTime.now();
        List<GroupMember> memberships = groupMemberRepository.findByUser(user);
        List<CalendarEvent> allUpcomingEvents = calendarEventRepository.findByAssociatedGroupInAndStartTimeAfter(
                memberships.stream().map(GroupMember::getGroup).collect(Collectors.toList()), now);
        return allUpcomingEvents.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<CalendarEventDTO> getAllEventsForUser(User user) {
        List<GroupMember> memberships = groupMemberRepository.findByUser(user);
        List<CalendarEvent> allEvents = calendarEventRepository.findByAssociatedGroupIn(
                memberships.stream().map(GroupMember::getGroup).collect(Collectors.toList()));
        return allEvents.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<CalendarEventDTO> getEventsByUser(User user) {
        List<CalendarEvent> userEvents = calendarEventRepository.findByCreatedBy(user);
        return userEvents.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<CalendarEventDTO> getEventsByStatus(Long groupId, String status, User user) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));

        String userRole = groupService.getUserRoleInGroup(groupId, user);
        if ("non-member".equals(userRole)) {
            throw new RuntimeException("You must be a member of the group to view events.");
        }

        CalendarEvent.EventStatus eventStatus = CalendarEvent.EventStatus.valueOf(status.toUpperCase());
        List<CalendarEvent> events = calendarEventRepository.findByAssociatedGroupAndStatus(group, eventStatus);
        return events.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<CalendarEventDTO> getEventsByDateRange(Long groupId, LocalDateTime start, LocalDateTime end, User user) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));

        String userRole = groupService.getUserRoleInGroup(groupId, user);
        if ("non-member".equals(userRole)) {
            throw new RuntimeException("You must be a member of the group to view events.");
        }

        List<CalendarEvent> events = calendarEventRepository.findByAssociatedGroupAndStartTimeBetween(group, start, end);
        return events.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
}
