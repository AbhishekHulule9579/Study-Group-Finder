package com.studyGroup.backend.repository;

import com.studyGroup.backend.model.MessageDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageDocumentRepository extends JpaRepository<MessageDocument, Long> {
    MessageDocument findByMessage_Id(Long messageId);
}
