package com.studyGroup.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalendarEventDTO {

    private Long id;
    private String topic;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String location;
    private String meetingLink;
    private String organizerName;
    private String sessionType;
    private String passcode;
    private Long groupId;
    private String groupName;
    private String courseName;
    private UserSummaryDTO createdBy;
    private String status;

    // Constructor for creation (without id and createdBy)
    public CalendarEventDTO(String topic, String description, LocalDateTime startTime, LocalDateTime endTime,
                            String location, String meetingLink, String organizerName, String sessionType, String passcode,
                            Long groupId, String status) {
        this.topic = topic;
        this.description = description;
        this.startTime = startTime;
        this.endTime = endTime;
        this.location = location;
        this.meetingLink = meetingLink;
        this.organizerName = organizerName;
        this.sessionType = sessionType;
        this.passcode = passcode;
        this.groupId = groupId;
        this.status = status;
    }
}
