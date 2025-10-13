package com.studyGroup.infosys.service;

import com.studyGroup.infosys.dto.CourseSummaryDTO;
import com.studyGroup.infosys.dto.CreateGroupRequest;
import com.studyGroup.infosys.dto.GroupDTO;
import com.studyGroup.infosys.dto.UserSummaryDTO;
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

    private GroupDTO convertToDTO(Group group) {
        long memberCount = groupMemberRepository.countByGroup(group);
        boolean hasPasskey = group.getPasskey() != null && !group.getPasskey().isEmpty();
        return new GroupDTO(
                group.getGroupId(),
                group.getName(),
                group.getDescription(),
                new CourseSummaryDTO(group.getAssociatedCourse().getCourseId(), group.getAssociatedCourse().getCourseName()),
                new UserSummaryDTO(group.getCreatedBy().getId(), group.getCreatedBy().getName()),
                group.getPrivacy(),
                group.getMemberLimit(),
                memberCount,
                hasPasskey
        );
    }

    public List<GroupDTO> findGroupsByUserId(Integer userId) {
        List<GroupMember> memberships = groupMemberRepository.findByUserId(userId);
        return memberships.stream()
                .map(GroupMember::getGroup)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public GroupDTO createGroup(CreateGroupRequest request, User user) {
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

        GroupMember ownerMembership = new GroupMember();
        ownerMembership.setId(new GroupMemberId(savedGroup.getGroupId(), user.getId()));
        ownerMembership.setGroup(savedGroup);
        ownerMembership.setUser(user);
        ownerMembership.setRole("Owner");
        groupMemberRepository.save(ownerMembership);

        return convertToDTO(savedGroup);
    }

    public List<GroupDTO> getAllGroups() {
        return groupRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void joinGroup(Long groupId, User user, String passkey) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));

        if ("private".equalsIgnoreCase(group.getPrivacy()) && group.getPasskey() != null && !group.getPasskey().isEmpty()) {
            if (passkey == null || !passkey.equals(group.getPasskey())) {
                throw new RuntimeException("Invalid passkey for this private group.");
            }
        }

        if (groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new RuntimeException("You are already a member of this group.");
        }

        long currentMemberCount = groupMemberRepository.countByGroup(group);
        if (currentMemberCount >= group.getMemberLimit()) {
            throw new RuntimeException("This group is full and cannot accept new members.");
        }

        GroupMember newMembership = new GroupMember();
        newMembership.setId(new GroupMemberId(group.getGroupId(), user.getId()));
        newMembership.setGroup(group);
        newMembership.setUser(user);
        newMembership.setRole("Member");
        groupMemberRepository.save(newMembership);
    }
}

