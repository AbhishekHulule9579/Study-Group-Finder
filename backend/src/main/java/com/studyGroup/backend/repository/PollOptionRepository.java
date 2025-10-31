package com.studyGroup.backend.repository;

import com.studyGroup.backend.model.PollOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PollOptionRepository extends JpaRepository<PollOption, Long> {
    List<PollOption> findByPoll_IdOrderById(Long pollId);
}
