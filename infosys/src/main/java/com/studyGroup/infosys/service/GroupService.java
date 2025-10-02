package com.studyGroup.infosys.service;

import com.studyGroup.infosys.model.Group;
import com.studyGroup.infosys.model.GroupMember;
import com.studyGroup.infosys.repository.GroupMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GroupService {

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    /**
     * Finds all the study groups a specific user has joined.
     * @param userId The ID of the user.
     * @return A list of Group objects.
     */
    public List<Group> findGroupsByUserId(Integer userId) {
        // 1. Find all GroupMember entries for the given user.
        List<GroupMember> memberships = groupMemberRepository.findByUserId(userId);

        // 2. For each membership, get the associated Group object and collect them into a new list.
        return memberships.stream()
                .map(GroupMember::getGroup)
                .collect(Collectors.toList());
    }
}
