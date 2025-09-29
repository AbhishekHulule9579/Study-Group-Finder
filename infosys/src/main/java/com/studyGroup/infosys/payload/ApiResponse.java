package com.studyGroup.infosys.payload;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ApiResponse {
    private Boolean success;
    private String message;

    public ApiResponse(String message) {
        this.message = message;
    }
}
