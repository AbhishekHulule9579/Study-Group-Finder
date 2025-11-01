package com.studyGroup.backend.service;

import com.studyGroup.backend.model.PinnedMessage;
import com.studyGroup.backend.repository.PinnedMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class PinnedMessageService {
    
    @Autowired
    private PinnedMessageRepository pinnedMessageRepository;

    @Transactional
    public PinnedMessage pinMessage(Long groupId, Long messageId, Integer userId) {
        if (pinnedMessageRepository.existsByGroupIdAndMessageId(groupId, messageId)) {
            throw new RuntimeException("Message is already pinned");
        }
        PinnedMessage pinnedMessage = new PinnedMessage(groupId, messageId, userId);
        return pinnedMessageRepository.save(pinnedMessage);
    }

    @Transactional
    public void unpinMessage(Long groupId, Long messageId) {
        if (!pinnedMessageRepository.existsByGroupIdAndMessageId(groupId, messageId)) {
            throw new RuntimeException("Message is not pinned");
        }
        pinnedMessageRepository.deleteByGroupIdAndMessageId(groupId, messageId);
    }

    public List<PinnedMessage> getPinnedMessages(Long groupId) {
        return pinnedMessageRepository.findByGroupId(groupId);
    }
}