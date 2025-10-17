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

    /**
     * Finds all join requests for a specific group.
     */
    List<GroupJoinRequest> findByGroup(Group group);

    /**
     * Finds a specific join request by the group and the user who made the request.
     */
    Optional<GroupJoinRequest> findByGroupAndUser(Group group, User user);

    /**
     * Checks if a join request from a specific user for a specific group already exists.
     * Used in GroupService to prevent duplicate requests.
     */
    boolean existsByGroupAndUser(Group group, User user);

    /**
     * Finds all join requests for a group that have a specific status (e.g., "PENDING").
     * Used in GroupService to fetch requests for approval/rejection.
     */
    List<GroupJoinRequest> findByGroupAndStatus(Group group, String status);
}

