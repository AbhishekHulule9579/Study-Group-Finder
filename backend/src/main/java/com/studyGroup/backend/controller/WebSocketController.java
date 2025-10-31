package com.studyGroup.backend.controller;

import com.studyGroup.backend.dto.ChatMessageDTO;
import com.studyGroup.backend.model.GroupMessage;
import com.studyGroup.backend.service.GroupMessageService;
import com.studyGroup.backend.repository.MessageReplyRepository;
import com.studyGroup.backend.model.MessageReply;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final GroupMessageService groupMessageService;
    private final MessageReplyRepository messageReplyRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage/{groupId}")
    public void sendMessage(@DestinationVariable Long groupId, ChatMessageDTO chatMessage) {
        chatMessage.setGroupId(groupId); // Ensure groupId is set from path variable
        chatMessage.setTimestamp(LocalDateTime.now()); // Set server-side timestamp

        // Save the message and return it
        GroupMessage savedMessage = groupMessageService.saveMessage(chatMessage);

        // Build DTO and include reply info if any
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setGroupId(savedMessage.getGroup().getGroupId());
        dto.setMessageId(savedMessage.getId());
        dto.setSenderId(savedMessage.getSender().getId());
        dto.setSenderName(savedMessage.getSender().getName());
        dto.setContent(savedMessage.getContent());
        dto.setTimestamp(savedMessage.getTimestamp());
        dto.setMessageType(savedMessage.getMessageType());

        // If a MessageReply exists linking this saved message, include reply info
        messageReplyRepository.findByReplyMessage_Id(savedMessage.getId()).ifPresent(mr -> {
            dto.setReplyToMessageId(mr.getOriginalMessage().getId());
            dto.setReplyToContent(mr.getOriginalMessage().getContent());
            dto.setReplyToSenderName(mr.getOriginalMessage().getSender().getName());
        });

        // Explicitly broadcast to topic so all subscribers receive the persisted message
        messagingTemplate.convertAndSend("/topic/group/" + groupId, dto);
    }
}