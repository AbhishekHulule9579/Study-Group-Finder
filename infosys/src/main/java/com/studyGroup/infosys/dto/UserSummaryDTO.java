package com.studyGroup.infosys.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserSummaryDTO {
    private Integer userId;
    private String name;
    private String email;

    public UserSummaryDTO(Integer userId, String name) {
        this.userId = userId;
        this.name = name;
    }
}
