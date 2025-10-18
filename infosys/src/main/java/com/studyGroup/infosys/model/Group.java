package com.studyGroup.infosys.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Objects;

@Data
@Entity
@Table(name = "study_groups")
public class Group {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long groupId;

    private String name;
    private String description;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course associatedCourse;

    @ManyToOne
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    private String privacy;
    private int memberLimit;
    private String passkey;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Group group = (Group) o;
        return Objects.equals(groupId, group.groupId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(groupId);
    }
}
