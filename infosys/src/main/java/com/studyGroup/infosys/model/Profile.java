package com.studyGroup.infosys.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    @Id
    @Column(name = "email")
    private String email;

    @Column(name = "fullname")
    private String fullname;

    // This definition is crucial. It allows the database column to store the
    // very long text string of an uploaded avatar image.
    @Column(name = "profile_pic_url", columnDefinition = "LONGTEXT")
    private String profilePicUrl;

    @Column(name = "phone")
    private String phone;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    // --- THIS IS THE NEW FIELD ---
    /**
     * Stores a list of enrolled course IDs as a JSON string (e.g., "[1, 2, 5]").
     * Using TEXT allows for a long list of courses.
     */
    @Column(name = "enrolled_course_ids", columnDefinition = "TEXT")
    private String enrolledCourseIds = "[]"; // Default to an empty JSON array
}

