package com.studyGroup.backend.repository;

import com.studyGroup.backend.model.GroupMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GroupMessageRepository extends JpaRepository<GroupMessage, Long> {

    /**
     * Finds all messages for a given group, ordered by timestamp ascending.
     * This is the main method you'll use to load a chat history.
     */
    List<GroupMessage> findByGroup_GroupIdOrderByTimestampAsc(Long groupId);
}