package com.studyGroup.infosys.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class LoginDto {
    @NotBlank
    @Email
    @Pattern(regexp=".+@gmail\\.com$",message="Enter valid email")
    private String email;

    @NotBlank
    private String password;
}
