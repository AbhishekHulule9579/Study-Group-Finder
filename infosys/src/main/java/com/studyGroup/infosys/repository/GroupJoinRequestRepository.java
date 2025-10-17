package com.studyGroup.infosys.repository;

import com.studyGroup.infosys.model.Group;
import com.studyGroup.infosys.model.GroupJoinRequest;
import com.studyGroup.infosys.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupJoinRequestRepository extends JpaRepository<GroupJoinRequest, Long> {
    List<GroupJoinRequest> findByGroup(Group group);
    Optional<GroupJoinRequest> findByGroupAndUser(Group group, User user);
    boolean existsByGroupAndUser(Group group, User user);
}
