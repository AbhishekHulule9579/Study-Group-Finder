package com.studyGroup.infosys.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JoinRequestDTO {
    private Long id;
    private UserSummaryDTO user;
}
