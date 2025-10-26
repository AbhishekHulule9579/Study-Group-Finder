package com.studyGroup.backend.controller;

import com.studyGroup.backend.dto.GroupMessageDTO;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.Instant;

@Controller
public class GroupMessageController {

    private final SimpMessagingTemplate messagingTemplate;

    public GroupMessageController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Client sends to /app/group/{groupId}/send
     * We forward the message to /topic/group/{groupId}
     */
    @MessageMapping("/group/{groupId}/send")
    public void sendToGroup(@DestinationVariable String groupId, @Payload GroupMessageDTO message) {
        // set timestamp server-side if absent
        if (message.getTimestamp() == null) {
            message.setTimestamp(Instant.now());
        }

        // ensure groupId is set on message
        if (message.getGroupId() == null || message.getGroupId().isBlank()) {
            message.setGroupId(groupId);
        }

        messagingTemplate.convertAndSend("/topic/group/" + groupId, message);
    }

}
