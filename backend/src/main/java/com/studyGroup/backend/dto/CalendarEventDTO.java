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
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String location;
    private String meetingLink;
    private Long groupId;
    private UserSummaryDTO createdBy;
    private String status;

    // Constructor for creation (without id and createdBy)
    public CalendarEventDTO(String title, String description, LocalDateTime startTime, LocalDateTime endTime,
                            String location, String meetingLink, Long groupId, String status) {
        this.title = title;
        this.description = description;
        this.startTime = startTime;
        this.endTime = endTime;
        this.location = location;
        this.meetingLink = meetingLink;
        this.groupId = groupId;
        this.status = status;
    }
}
