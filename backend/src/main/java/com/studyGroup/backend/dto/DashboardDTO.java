package com.studyGroup.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
public class DashboardDTO {
    private List<GroupDTO> joinedGroups;
    private List<SuggestedPeerDTO> suggestedPeers;
    private int enrolledCoursesCount;
	public List<GroupDTO> getJoinedGroups() {
		return joinedGroups;
	}
	public void setJoinedGroups(List<GroupDTO> joinedGroups) {
		this.joinedGroups = joinedGroups;
	}
	public List<SuggestedPeerDTO> getSuggestedPeers() {
		return suggestedPeers;
	}
	public void setSuggestedPeers(List<SuggestedPeerDTO> suggestedPeers) {
		this.suggestedPeers = suggestedPeers;
	}
	public int getEnrolledCoursesCount() {
		return enrolledCoursesCount;
	}
	public void setEnrolledCoursesCount(int enrolledCoursesCount) {
		this.enrolledCoursesCount = enrolledCoursesCount;
	}
	public DashboardDTO(List<GroupDTO> joinedGroups, List<SuggestedPeerDTO> suggestedPeers, int enrolledCoursesCount) {
		super();
		this.joinedGroups = joinedGroups;
		this.suggestedPeers = suggestedPeers;
		this.enrolledCoursesCount = enrolledCoursesCount;
	}
	public DashboardDTO() {
		super();
	}
	
	
    
    
}
