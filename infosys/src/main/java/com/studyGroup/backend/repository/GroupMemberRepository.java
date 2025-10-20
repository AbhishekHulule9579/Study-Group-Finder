package com.studyGroup.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.studyGroup.backend.model.Group;
import com.studyGroup.backend.model.GroupMember;
import com.studyGroup.backend.model.GroupMemberId;
import com.studyGroup.backend.model.User;

import java.util.List;
import java.util.Optional; 

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {

    List<GroupMember> findByUserId(Integer userId);

    long countByGroup(Group group);

    boolean existsByGroupAndUser(Group group, User user);
    
    /**
     * FIX: Correct method naming to traverse to the Group entity (group) 
     * and use its specific primary key name (GroupId).
     * Assuming the User primary key is 'id' (User_Id).
     */
    Optional<GroupMember> findByGroupGroupIdAndUser_Id(Long groupId, Integer userId); 

    // Used by GroupService.getGroupMembers
    List<GroupMember> findByGroup(Group group);
}