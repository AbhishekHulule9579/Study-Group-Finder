package com.studyGroup.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "profile")
@Data
public class Profile {

    @Id
    @Column(name = "email")
    private String email;

    @Column(name = "fullname")
    private String fullname;

    @Column(name = "profile_pic_url", columnDefinition = "LONGTEXT")
    private String profilePicUrl;

    @Column(name = "phone")
    private String phone;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    // Added field for "About Me" with a large text definition (approx. 255 words)
    @Column(name = "about_me", columnDefinition = "VARCHAR(2000)")
    private String aboutMe;

    @Column(name = "enrolled_course_ids", columnDefinition = "TEXT")
    private String enrolledCourseIds = "[]";

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getFullname() {
		return fullname;
	}

	public void setFullname(String fullname) {
		this.fullname = fullname;
	}

	public String getProfilePicUrl() {
		return profilePicUrl;
	}

	public void setProfilePicUrl(String profilePicUrl) {
		this.profilePicUrl = profilePicUrl;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getGithubUrl() {
		return githubUrl;
	}

	public void setGithubUrl(String githubUrl) {
		this.githubUrl = githubUrl;
	}

	public String getLinkedinUrl() {
		return linkedinUrl;
	}

	public void setLinkedinUrl(String linkedinUrl) {
		this.linkedinUrl = linkedinUrl;
	}

	public String getAboutMe() {
		return aboutMe;
	}

	public void setAboutMe(String aboutMe) {
		this.aboutMe = aboutMe;
	}

	public String getEnrolledCourseIds() {
		return enrolledCourseIds;
	}

	public void setEnrolledCourseIds(String enrolledCourseIds) {
		this.enrolledCourseIds = enrolledCourseIds;
	}

	public Profile() {
		super();
		this.email = email;
		this.fullname = fullname;
		this.profilePicUrl = profilePicUrl;
		this.phone = phone;
		this.githubUrl = githubUrl;
		this.linkedinUrl = linkedinUrl;
		this.aboutMe = aboutMe;
		this.enrolledCourseIds = enrolledCourseIds;
	}


	
	
    
    
}