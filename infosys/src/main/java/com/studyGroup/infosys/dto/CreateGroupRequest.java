package com.studyGroup.infosys.dto;

import lombok.Data;

// This class is a Data Transfer Object (DTO) that represents the
// JSON payload for a "create group" request from the frontend.
@Data
public class CreateGroupRequest {
    // The name of the new group.
    private String name;

    // A description of the group's purpose.
    private String description;

    // The ID of the course this group is associated with.
    private String associatedCourseId;

    // The privacy setting for the group, e.g., "public" or "private".
    private String privacy;

    // An optional passkey required to join a private group.
    private String passkey;

    // The maximum number of members allowed in the group.
    private Integer memberLimit;
}
