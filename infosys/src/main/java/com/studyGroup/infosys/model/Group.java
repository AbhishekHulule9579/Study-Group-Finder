package com.studyGroup.infosys.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "study_group")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id")
    private Long groupId;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "associated_course_id", nullable = false)
    private Course associatedCourse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_userid", nullable = false)
    private User createdBy;

    private String privacy; 

    private String passkey; 

    @Column(name = "member_limit")
    private Integer memberLimit;
}