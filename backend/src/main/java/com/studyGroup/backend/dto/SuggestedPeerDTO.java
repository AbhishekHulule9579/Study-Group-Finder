package com.studyGroup.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
public class SuggestedPeerDTO {
    private PeerUserDTO user;
    private int commonCoursesCount;
    private Set<String> commonCourses;
	public PeerUserDTO getUser() {
		return user;
	}
	public void setUser(PeerUserDTO user) {
		this.user = user;
	}
	public int getCommonCoursesCount() {
		return commonCoursesCount;
	}
	public void setCommonCoursesCount(int commonCoursesCount) {
		this.commonCoursesCount = commonCoursesCount;
	}
	public Set<String> getCommonCourses() {
		return commonCourses;
	}
	public void setCommonCourses(Set<String> commonCourses) {
		this.commonCourses = commonCourses;
	}
	public SuggestedPeerDTO(PeerUserDTO user, int commonCoursesCount, Set<String> commonCourses) {
		super();
		this.user = user;
		this.commonCoursesCount = commonCoursesCount;
		this.commonCourses = commonCourses;
	}
    
    
}

