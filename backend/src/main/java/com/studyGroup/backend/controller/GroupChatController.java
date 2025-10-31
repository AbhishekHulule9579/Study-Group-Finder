package com.studyGroup.backend.controller;

import com.studyGroup.backend.dto.ChatMessageDTO;
import com.studyGroup.backend.model.GroupMessage;
import com.studyGroup.backend.service.GroupMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // Add your frontend URL here
public class GroupChatController {

    private final GroupMessageService groupMessageService;
    private final com.studyGroup.backend.repository.MessageReplyRepository messageReplyRepository;
    private final com.studyGroup.backend.service.JWTService jwtService;
    private final com.studyGroup.backend.service.UserService userService;
    private final com.studyGroup.backend.repository.PollOptionRepository pollOptionRepository;

    @GetMapping("/{groupId}/messages")
    public ResponseEntity<List<ChatMessageDTO>> getGroupMessages(@PathVariable Long groupId) {
        List<GroupMessage> messages = groupMessageService.getGroupMessages(groupId);
        
        List<ChatMessageDTO> messageDTOs = messages.stream().map(message -> {
            ChatMessageDTO dto = new ChatMessageDTO();
            dto.setGroupId(message.getGroup().getGroupId());
            dto.setMessageId(message.getId());
            dto.setSenderId(message.getSender().getId());
            dto.setSenderName(message.getSender().getName());
            dto.setContent(message.getContent());
            dto.setTimestamp(message.getTimestamp());
            dto.setMessageType(message.getMessageType());

            messageReplyRepository.findByReplyMessage_Id(message.getId()).ifPresent(mr -> {
                dto.setReplyToMessageId(mr.getOriginalMessage().getId());
                dto.setReplyToContent(mr.getOriginalMessage().getContent());
                dto.setReplyToSenderName(mr.getOriginalMessage().getSender().getName());
            });

            if ("POLL".equalsIgnoreCase(message.getMessageType()) && message.getPollId() != null) {
                dto.setPollId(message.getPollId());
                dto.setPollOptions(pollOptionRepository.findByPoll_IdOrderById(message.getPollId())
                        .stream()
                        .map(o -> new com.studyGroup.backend.dto.PollOptionDTO(o.getId(), o.getOptionText(), o.getVoteCount()))
                        .collect(Collectors.toList())
                );
            }

            return dto;
        }).collect(Collectors.toList());
            
        return ResponseEntity.ok(messageDTOs);
    }

    @DeleteMapping("/{groupId}/messages/{messageId}")
    public ResponseEntity<?> deleteGroupMessage(@PathVariable Long groupId, @PathVariable Long messageId,
                                                @RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String email = jwtService.validateToken(token);
        if ("401".equals(email)) {
            return ResponseEntity.status(401).body("Invalid/expired token");
        }
        var userOpt = userService.getUserByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body("User not found");
        Integer requesterId = userOpt.get().getId();

        try {
            groupMessageService.deleteMessage(messageId, requesterId);
            // Optionally, you may broadcast deletion via websocket (left as next step)
            return ResponseEntity.ok().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(403).body(ex.getMessage());
        }
    }
}