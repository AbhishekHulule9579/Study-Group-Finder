package com.studyGroup.infosys.dto;

import lombok.Data;

@Data
public class GroupDTO {
    private Long groupId;
    private String name;
    private String description;
    private CourseSummaryDTO associatedCourse;
    private UserSummaryDTO createdBy;
    private String privacy;
    private int memberLimit;
    private long memberCount;
    private boolean hasPasskey;
    private String userRole; // e.g., "owner", "member"
    private Integer ownerId;


    public GroupDTO(Long groupId, String name, String description, CourseSummaryDTO associatedCourse,
                    UserSummaryDTO createdBy, String privacy, int memberLimit, long memberCount, boolean hasPasskey, String userRole) {
        this.groupId = groupId;
        this.name = name;
        this.description = description;
        this.associatedCourse = associatedCourse;
        this.createdBy = createdBy;
        this.privacy = privacy;
        this.memberLimit = memberLimit;
        this.memberCount = memberCount;
        this.hasPasskey = hasPasskey;
        this.userRole = userRole;
    }
}
