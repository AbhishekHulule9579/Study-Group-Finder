package com.studyGroup.backend.service;

import com.studyGroup.backend.dto.GroupMessageDTO;
import com.studyGroup.backend.model.ChatMessage;
import com.studyGroup.backend.model.Group;
import com.studyGroup.backend.model.User;
import com.studyGroup.backend.repository.ChatMessageRepository;
import com.studyGroup.backend.repository.GroupRepository;
import com.studyGroup.backend.repository.UsersRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final GroupRepository groupRepository;
    private final UsersRepository usersRepository;

    public ChatMessageService(ChatMessageRepository chatMessageRepository,
                              GroupRepository groupRepository,
                              UsersRepository usersRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.groupRepository = groupRepository;
        this.usersRepository = usersRepository;
    }

    /**
     * Save an incoming GroupMessageDTO to the ChatMessage table.
     * Expects dto.groupId to be parseable as Long and dto.sender to be the user's email.
     * Returns the persisted ChatMessage or null if saving wasn't possible.
     */
    public ChatMessage saveMessage(GroupMessageDTO dto) {
        if (dto == null) return null;

        // parse group id
        Long gId = null;
        try {
            gId = Long.parseLong(dto.getGroupId());
        } catch (Exception e) {
            // cannot parse id
            return null;
        }

        Optional<Group> groupOpt = groupRepository.findById(gId);
        if (groupOpt.isEmpty()) return null;

        // try to find user by email
        Optional<User> userOpt = usersRepository.findByEmail(dto.getSender());
        if (userOpt.isEmpty()) return null;

        ChatMessage msg = new ChatMessage();
        msg.setGroup(groupOpt.get());
        msg.setSender(userOpt.get());
        msg.setContent(dto.getContent());
        // timestamp is set in entity @PrePersist

        return chatMessageRepository.save(msg);
    }
}
