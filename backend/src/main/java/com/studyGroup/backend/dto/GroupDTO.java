package com.studyGroup.backend.dto;

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
    private long memberCount;
    private boolean hasPasskey;
    private String userRole; 
}
