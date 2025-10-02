package com.studyGroup.infosys.dto;

import com.studyGroup.infosys.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuggestedPeerDTO {
    private User user;
    private int commonCoursesCount;
    private Set<String> commonCourses;
}
