package com.studyGroup.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class UserSummaryDTO {
    private Long id; 
    private String name;
    private String email; // 🚩 NEW: Added for profile data
    private String aboutMe; // 🚩 NEW: Added for profile data/bio
    private String role;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getAboutMe() {
		return aboutMe;
	}
	public void setAboutMe(String aboutMe) {
		this.aboutMe = aboutMe;
	}
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}
	public UserSummaryDTO(Long id, String name, String email, String aboutMe, String role) {
		super();
		this.id = id;
		this.name = name;
		this.email = email;
		this.aboutMe = aboutMe;
		this.role = role;
	} 
    
    
}