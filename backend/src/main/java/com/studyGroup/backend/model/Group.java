package com.studyGroup.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "study_group")
@Data
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id")
    private Long groupId;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "associated_course_id", nullable = false)
    private Course associatedCourse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_userid", nullable = false)
    private User createdBy;

    private String privacy; 

    private String passkey; 

    @Column(name = "member_limit")
    private Integer memberLimit;

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

	public Course getAssociatedCourse() {
		return associatedCourse;
	}

	public void setAssociatedCourse(Course associatedCourse) {
		this.associatedCourse = associatedCourse;
	}

	public User getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(User createdBy) {
		this.createdBy = createdBy;
	}

	public String getPrivacy() {
		return privacy;
	}

	public void setPrivacy(String privacy) {
		this.privacy = privacy;
	}

	public String getPasskey() {
		return passkey;
	}

	public void setPasskey(String passkey) {
		this.passkey = passkey;
	}

	public Integer getMemberLimit() {
		return memberLimit;
	}

	public void setMemberLimit(Integer memberLimit) {
		this.memberLimit = memberLimit;
	}

	public Group(Long groupId, String name, String description, Course associatedCourse, User createdBy, String privacy,
			String passkey, Integer memberLimit) {
		super();
		this.groupId = groupId;
		this.name = name;
		this.description = description;
		this.associatedCourse = associatedCourse;
		this.createdBy = createdBy;
		this.privacy = privacy;
		this.passkey = passkey;
		this.memberLimit = memberLimit;
	}

	public Group() {
		super();
	}
    
	
    
}