package com.studyGroup.infosys.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupDTO {
    private Long id;
    private String name;
    private String description;
    private String privacy;
    private String adminName;
    private List<UserSummaryDTO> members;

}
