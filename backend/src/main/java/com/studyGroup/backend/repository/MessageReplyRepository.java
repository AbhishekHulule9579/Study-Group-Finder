package com.studyGroup.backend.repository;

import com.studyGroup.backend.model.MessageReply;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageReplyRepository extends JpaRepository<MessageReply, Long> {
    Optional<MessageReply> findByReplyMessage_Id(Long replyMessageId);
}
