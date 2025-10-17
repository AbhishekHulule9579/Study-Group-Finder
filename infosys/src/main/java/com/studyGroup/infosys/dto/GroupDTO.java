package com.studyGroup.infosys.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupDTO {
    private Long groupId;
    private String name;
    private String description;
    private String creatorEmail;
}
