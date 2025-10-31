package com.studyGroup.backend.dto;

import lombok.Data;

@Data
public class CreateGroupRequest {

    private String name;

    private String description;

    private String associatedCourseId;

    private String privacy;

    private String passkey;

    private Integer memberLimit;

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

	public String getAssociatedCourseId() {
		return associatedCourseId;
	}

	public void setAssociatedCourseId(String associatedCourseId) {
		this.associatedCourseId = associatedCourseId;
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

	public CreateGroupRequest(String name, String description, String associatedCourseId, String privacy,
			String passkey, Integer memberLimit) {
		super();
		this.name = name;
		this.description = description;
		this.associatedCourseId = associatedCourseId;
		this.privacy = privacy;
		this.passkey = passkey;
		this.memberLimit = memberLimit;
	}
    
    public CreateGroupRequest(){
		super();
		
	}
}
