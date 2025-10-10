package com.studyGroup.infosys.service;

import com.studyGroup.infosys.dto.CreateGroupRequest;
import com.studyGroup.infosys.dto.GroupDTO;
import com.studyGroup.infosys.model.*;
import com.studyGroup.infosys.repository.GroupMemberRepository;
import com.studyGroup.infosys.repository.GroupRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GroupService {

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private CourseService courseService;

    // Corrected method to return List<GroupDTO>
    public List<GroupDTO> findGroupsByUserId(Integer userId) {
        List<GroupMember> memberships = groupMemberRepository.findByUserId(userId);
        return memberships.stream()
                .map(GroupMember::getGroup)
                .map(GroupDTO::fromEntity) // Convert each Group to a GroupDTO
                .collect(Collectors.toList());
    }

    @Transactional
    public Group createGroup(CreateGroupRequest request, User user) {
        Course course = courseService.getCourseById(request.getAssociatedCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found with ID: " + request.getAssociatedCourseId()));

        Group group = new Group();
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setAssociatedCourse(course);
        group.setCreatedBy(user);
        group.setPrivacy(request.getPrivacy());
        group.setMemberLimit(request.getMemberLimit());

        if ("private".equalsIgnoreCase(request.getPrivacy()) && request.getPasskey() != null && !request.getPasskey().isEmpty()) {
            group.setPasskey(request.getPasskey());
        }

        Group savedGroup = groupRepository.save(group);

        // Add the creator as the first member with the 'Owner' role
        GroupMember ownerMembership = new GroupMember();
        ownerMembership.setId(new GroupMemberId(savedGroup.getGroupId(), user.getId()));
        ownerMembership.setGroup(savedGroup);
        ownerMembership.setUser(user);
        ownerMembership.setRole("Owner");
        groupMemberRepository.save(ownerMembership);

        return savedGroup;
    }

    public List<GroupDTO> getAllGroups() {
        return groupRepository.findAll().stream()
                .map(GroupDTO::fromEntity)
                .collect(Collectors.toList());
    }
}

