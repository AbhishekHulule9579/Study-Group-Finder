package com.studyGroup.backend.dto;

import lombok.Data;

@Data
public class CreateGroupRequest {

    private String name;

    private String description;

    private String associatedCourseId;

    private String privacy;

    private String passkey;

    private Integer memberLimit;
}
