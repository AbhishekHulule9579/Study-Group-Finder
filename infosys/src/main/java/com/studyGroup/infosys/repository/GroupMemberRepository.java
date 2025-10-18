package com.studyGroup.infosys.repository;

import com.studyGroup.infosys.model.Group;
import com.studyGroup.infosys.model.GroupMember;
import com.studyGroup.infosys.model.GroupMemberId;
import com.studyGroup.infosys.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {

    List<GroupMember> findByUserId(Integer userId);

    long countByGroup(Group group);

    boolean existsByGroupAndUser(Group group, User user);

    Optional<GroupMember> findByGroupAndUser(Group group, User user);
}
