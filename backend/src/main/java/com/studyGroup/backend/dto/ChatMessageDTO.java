package com.studyGroup.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    private Long groupId;
    private Long messageId;
    private Integer senderId;
    private String senderName;
    private String content;
    private LocalDateTime timestamp;
    private String messageType;
    // Optional reply info (if this message is a reply to another message)
    private Long replyToMessageId;
    private String replyToContent;
    private String replyToSenderName;
    // Poll info
    private Long pollId;
    private List<com.studyGroup.backend.dto.PollOptionDTO> pollOptions;
}