// infosys/src/main/java/com/studyGroup/infosys/repository/GroupJoinRequestRepository.java

package com.studyGroup.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.studyGroup.backend.model.Group;
import com.studyGroup.backend.model.GroupJoinRequest;
import com.studyGroup.backend.model.User;

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