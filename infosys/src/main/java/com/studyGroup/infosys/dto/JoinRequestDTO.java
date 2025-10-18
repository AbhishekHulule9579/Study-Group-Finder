package com.studyGroup.infosys.dto;

import lombok.Data;

@Data
public class JoinRequestDTO {
    private Long requestId;
    private String status; // APPROVED or DENIED
}
