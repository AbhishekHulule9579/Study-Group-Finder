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
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "fullname")
    private String fullname;

    @Column(name = "profile_pic_url") 
    private String profilePicUrl;

    @Column(name = "phone")
    private String phone;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "education", columnDefinition = "TEXT")
    private String education;
}
