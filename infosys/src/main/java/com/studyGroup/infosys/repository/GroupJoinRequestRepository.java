// infosys/src/main/java/com/studyGroup/infosys/repository/GroupJoinRequestRepository.java

package com.studyGroup.infosys.repository;

import com.studyGroup.infosys.model.Group;
import com.studyGroup.infosys.model.GroupJoinRequest;
import com.studyGroup.infosys.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import jakarta.transaction.Transactional; 

import java.util.List;

@Repository
public interface GroupJoinRequestRepository extends JpaRepository<GroupJoinRequest, Long> {
    
    boolean existsByGroupAndUserAndStatus(Group group, User user, String status);

    // This method is CRITICAL for showing pending requests on the admin page
    List<GroupJoinRequest> findByGroupAndStatus(Group group, String status); 

    @Transactional
    void deleteByGroup(Group group);
    
    // 🚩 NEW: Cleans up any outstanding requests from a user being removed from a group
    @Transactional
    void deleteByGroupAndUser(Group group, User user); 
}