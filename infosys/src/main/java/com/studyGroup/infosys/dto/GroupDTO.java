package com.studyGroup.infosys.dto;

import com.studyGroup.infosys.model.Group;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupDTO {
    private Long groupId;
    private String name;
    private String description;
    private CourseSummaryDTO associatedCourse;
    private UserSummaryDTO createdBy;
    private String privacy;
    private Integer memberLimit;
    // Passkey is intentionally omitted for security

    public static GroupDTO fromEntity(Group group) {
        return new GroupDTO(
                group.getGroupId(),
                group.getName(),
                group.getDescription(),
                new CourseSummaryDTO(group.getAssociatedCourse().getCourseId(), group.getAssociatedCourse().getCourseName()),
                new UserSummaryDTO(group.getCreatedBy().getId(), group.getCreatedBy().getName()),
                group.getPrivacy(),
                group.getMemberLimit()
        );
    }
}
