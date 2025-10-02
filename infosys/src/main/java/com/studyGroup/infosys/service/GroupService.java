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

    
    public List<Group> findGroupsByUserId(Integer userId) {
        
        List<GroupMember> memberships = groupMemberRepository.findByUserId(userId);

         return memberships.stream()
                .map(GroupMember::getGroup)
                .collect(Collectors.toList());
    }
}
