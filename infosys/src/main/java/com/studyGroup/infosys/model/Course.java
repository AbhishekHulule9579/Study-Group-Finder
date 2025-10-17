package com.studyGroup.infosys.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;

@Entity
@Data
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer courseId;
    private String courseName;
    private String courseDescription;

    @ManyToMany(mappedBy = "courses")
    @JsonIgnore // Prevents infinite recursion when serializing
    private Set<User> users = new HashSet<>();
}
