package com.studyGroup.infosys.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "profile")
public class Profile {

    @Id
    @Column(name = "email", nullable = false, unique = true)
    private String email; // same as used in signup

    @Column(name = "profile_pic")
    private String profilePic; // can be file URL or base64 string

    @Column(name = "phone")
    private String phone;

    @Column(name = "github")
    private String github;

    @Column(name = "linkedin")
    private String linkedin;

    // You can use JSON, or create an Education table instead for normalization
    @Column(name = "education", columnDefinition = "TEXT")
    private String education; // store JSON/text for demo; use separate table for production

    @Column(name = "fullname")
    private String fullname;

    // Default constructor
    public Profile() {}

    // Parameterized constructor including fullname
    public Profile(String email, String profilePic, String phone, String github,
                   String linkedin, String education, String fullname) {
        this.email = email;
        this.profilePic = profilePic;
        this.phone = phone;
        this.github = github;
        this.linkedin = linkedin;
        this.education = education;
        this.fullname = fullname;
    }

    // Getters and setters

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getProfilePic() {
        return profilePic;
    }

    public void setProfilePic(String profilePic) {
        this.profilePic = profilePic;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getGithub() {
        return github;
    }

    public void setGithub(String github) {
        this.github = github;
    }

    public String getLinkedin() {
        return linkedin;
    }

    public void setLinkedin(String linkedin) {
        this.linkedin = linkedin;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }
}
