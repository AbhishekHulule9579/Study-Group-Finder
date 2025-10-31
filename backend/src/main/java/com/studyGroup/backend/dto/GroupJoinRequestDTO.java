package com.studyGroup.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class GroupJoinRequestDTO {
    private Long id;
    private UserSummaryDTO user;
    private String status;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public UserSummaryDTO getUser() {
		return user;
	}
	public void setUser(UserSummaryDTO user) {
		this.user = user;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public GroupJoinRequestDTO(Long id, UserSummaryDTO user, String status) {
		super();
		this.id = id;
		this.user = user;
		this.status = status;
	}
	public GroupJoinRequestDTO() {
		super();
	}
    
    
}
