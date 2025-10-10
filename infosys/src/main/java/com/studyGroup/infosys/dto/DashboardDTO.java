package com.studyGroup.infosys.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private List<GroupDTO> joinedGroups;
    private List<SuggestedPeerDTO> suggestedPeers;
    private int enrolledCoursesCount;
}
