package com.studyGroup.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupJoinRequestDTO {
    private Long id;
    private UserSummaryDTO user;
    private String status;
}
