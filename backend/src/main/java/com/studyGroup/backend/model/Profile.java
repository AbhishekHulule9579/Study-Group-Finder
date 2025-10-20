package com.studyGroup.backend.model;

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

    @Column(name = "profile_pic_url", columnDefinition = "LONGTEXT")
    private String profilePicUrl;

    @Column(name = "phone")
    private String phone;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    // Added field for "About Me" with a large text definition (approx. 255 words)
    @Column(name = "about_me", columnDefinition = "VARCHAR(2000)")
    private String aboutMe;

    @Column(name = "enrolled_course_ids", columnDefinition = "TEXT")
    private String enrolledCourseIds = "[]"; 
}