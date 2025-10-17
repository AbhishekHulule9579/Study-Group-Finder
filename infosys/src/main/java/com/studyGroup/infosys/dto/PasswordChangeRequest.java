package com.studyGroup.infosys.dto;

import lombok.Data;

@Data
public class PasswordChangeRequest {
    private String email;
    private String newPassword;
    private String confirmPassword;
}
