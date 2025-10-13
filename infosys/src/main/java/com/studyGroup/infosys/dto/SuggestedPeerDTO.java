package com.studyGroup.infosys.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuggestedPeerDTO {
    private PeerUserDTO user;
    private int commonCoursesCount;
    private Set<String> commonCourses;
}

