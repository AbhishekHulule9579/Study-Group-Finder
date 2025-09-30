package com.studyGroup.infosys.dto;

import lombok.Data;

// Using Lombok's @Data annotation to automatically generate 
// getters, setters, constructors, and toString().
@Data
public class LoginRequest {
    private String email;
    private String password;
}

