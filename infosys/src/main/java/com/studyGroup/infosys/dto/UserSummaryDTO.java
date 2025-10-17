package com.studyGroup.infosys.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserSummaryDTO {
    private Integer id;
    private String username;
    private String email;

    public UserSummaryDTO(Integer id, String username) {
        this.id = id;
        this.username = username;
    }
}
