package com.studyGroup.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data // Provides getters, setters, equals, hashCode, and toString
@NoArgsConstructor // 🚩 FIX: Generates the required public no-argument constructor for JPA
@AllArgsConstructor // Generates the parameterized constructor (Long groupId, Integer userId)
public class GroupMemberId implements Serializable {

    @Column(name = "group_id")
    private Long groupId;

    @Column(name = "user_id")
    private Integer userId;

    // All boilerplate methods (constructors, getters, setters, equals, hashCode, toString) 
    // are now handled automatically by the Lombok annotations above.
    // You MUST remove any manually written methods (e.g., public GroupMemberId(), @Override public boolean equals(Object o), etc.) 
    // from this file, as they are redundant and can interfere with Lombok's generation.
}