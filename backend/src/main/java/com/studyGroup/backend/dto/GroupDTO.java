package com.studyGroup.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
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
	public Long getGroupId() {
		return groupId;
	}
	public void setGroupId(Long groupId) {
		this.groupId = groupId;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public CourseSummaryDTO getAssociatedCourse() {
		return associatedCourse;
	}
	public void setAssociatedCourse(CourseSummaryDTO associatedCourse) {
		this.associatedCourse = associatedCourse;
	}
	public UserSummaryDTO getCreatedBy() {
		return createdBy;
	}
	public void setCreatedBy(UserSummaryDTO createdBy) {
		this.createdBy = createdBy;
	}
	public String getPrivacy() {
		return privacy;
	}
	public void setPrivacy(String privacy) {
		this.privacy = privacy;
	}
	public Integer getMemberLimit() {
		return memberLimit;
	}
	public void setMemberLimit(Integer memberLimit) {
		this.memberLimit = memberLimit;
	}
	public long getMemberCount() {
		return memberCount;
	}
	public void setMemberCount(long memberCount) {
		this.memberCount = memberCount;
	}
	public boolean isHasPasskey() {
		return hasPasskey;
	}
	public void setHasPasskey(boolean hasPasskey) {
		this.hasPasskey = hasPasskey;
	}
	public String getUserRole() {
		return userRole;
	}
	public void setUserRole(String userRole) {
		this.userRole = userRole;
	}
	public GroupDTO(Long groupId, String name, String description, CourseSummaryDTO associatedCourse,
			UserSummaryDTO createdBy, String privacy, Integer memberLimit, long memberCount, boolean hasPasskey,
			String userRole) {
		super();
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
