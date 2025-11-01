package com.studyGroup.backend.repository;

import com.studyGroup.backend.model.PinnedMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PinnedMessageRepository extends JpaRepository<PinnedMessage, Long> {
    List<PinnedMessage> findByGroupId(Long groupId);
    boolean existsByGroupIdAndMessageId(Long groupId, Long messageId);
    void deleteByGroupIdAndMessageId(Long groupId, Long messageId);
}