package com.studyGroup.backend.dto;

import com.studyGroup.backend.model.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PeerUserDTO {
    private Integer id;
    private String name;
    private String universityName;

    public static PeerUserDTO fromEntity(User user) {
        if (user == null) {
            return null;
        }
        return new PeerUserDTO(
                user.getId(),
                user.getName(),
                user.getUniversityName()
        );
    }
}
