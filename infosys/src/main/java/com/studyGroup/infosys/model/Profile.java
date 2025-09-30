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
@Data // Generates getters, setters, toString, equals, and hashCode
@NoArgsConstructor // Generates a no-argument constructor
@AllArgsConstructor // Generates a constructor with all arguments
public class Profile {

    @Id
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "fullname")
    private String fullname;

    @Column(name = "profile_pic_url") // Storing URL is generally better than base64
    private String profilePicUrl;

    @Column(name = "phone")
    private String phone;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    // For simplicity, we'll keep education as a simple text field.
    // In a production app, this would ideally be a separate 'Education' table.
    @Column(name = "education", columnDefinition = "TEXT")
    private String education;
}
