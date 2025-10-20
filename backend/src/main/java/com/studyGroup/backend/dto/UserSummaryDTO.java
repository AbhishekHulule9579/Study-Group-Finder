package com.studyGroup.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDTO {
    private Long id; 
    private String name;
    private String email; // 🚩 NEW: Added for profile data
    private String aboutMe; // 🚩 NEW: Added for profile data/bio
    private String role; 
}