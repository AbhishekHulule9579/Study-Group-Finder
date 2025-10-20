// infosys/src/main/java/com/studyGroup/infosys/repository/GroupJoinRequestRepository.java

package com.studyGroup.infosys.repository;

import com.studyGroup.infosys.model.Group;
import com.studyGroup.infosys.model.GroupJoinRequest;
import com.studyGroup.infosys.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import jakarta.transaction.Transactional; // Import Transactional if it's not already there

import java.util.List;

@Repository
public interface GroupJoinRequestRepository extends JpaRepository<GroupJoinRequest, Long> {
    
    boolean existsByGroupAndUserAndStatus(Group group, User user, String status);

    List<GroupJoinRequest> findByGroupAndStatus(Group group, String status);

    // --- NEW METHOD FOR CASCADING DELETE LOGIC ---
    @Transactional
    void deleteByGroup(Group group);
    // ---------------------------------------------
}