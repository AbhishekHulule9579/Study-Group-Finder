package com.studyGroup.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "calendar_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalendarEvent {

    public enum EventStatus {
        ONGOING,
        DONE,
        CANCELED
    }

    public enum SessionType {
        ONLINE,
        HYBRID,
        OFFLINE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String topic;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    private String location;

    @Column(name = "meeting_link")
    private String meetingLink;

    @Column(name = "organizer_name")
    private String organizerName;

    @Enumerated(EnumType.STRING)
    @Column(name = "session_type", nullable = false)
    private SessionType sessionType;

    private String passcode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group associatedGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status = EventStatus.ONGOING;

    @Column(name = "created_at", nullable = true)
    private LocalDateTime createdAt;

    @Column(name = "reminder_sent")
    private Boolean reminderSent = false;

    @Column(name = "reminder_10_min_sent")
    private Boolean reminder10MinSent = false;

    @Column(name = "reminder_1_min_sent")
    private Boolean reminder1MinSent = false;

    @Column(name = "reminder_1_hour_sent")
    private Boolean reminder1HourSent = false;
}
