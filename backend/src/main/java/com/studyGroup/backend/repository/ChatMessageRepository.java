package com.studyGroup.backend.repository;

import com.studyGroup.backend.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    
    List<ChatMessage> findByGroup_GroupIdOrderByTimestampAsc(Long groupId);

}