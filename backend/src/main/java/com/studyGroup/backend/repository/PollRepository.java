package com.studyGroup.backend.repository;

import com.studyGroup.backend.model.Poll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PollRepository extends JpaRepository<Poll, Long> {
    List<Poll> findByGroup_GroupIdOrderByCreatedAtDesc(Long groupId);
}
