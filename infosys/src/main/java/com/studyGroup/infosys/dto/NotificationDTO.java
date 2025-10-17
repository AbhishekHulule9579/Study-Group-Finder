package com.studyGroup.infosys.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private String message;
    private boolean isRead;
    private LocalDateTime timestamp;
}
