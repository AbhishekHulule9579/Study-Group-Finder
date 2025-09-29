package com.studyGroup.infosys.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user")
public class User{

    @Column(name = "fullname")
    private String fullname;

    @Id
    @Column(name = "email")
    private String email;

    @Column(name = "role")
    private int role;

    @Column(name = "password")
    private String password;

    @Column(name = "secondary_school")
    private String secondarySchool;

    @Column(name = "secondary_school_passing_year")
    private Integer secondarySchoolPassingYear;

    @Column(name = "secondary_school_percentage")
    private Double secondarySchoolPercentage;

    @Column(name = "higher_secondary_school")
    private String higherSecondarySchool;

    @Column(name = "higher_secondary_passing_year")
    private Integer higherSecondaryPassingYear;

    @Column(name = "higher_secondary_percentage")
    private Double higherSecondaryPercentage;

    @Column(name = "university_name")
    private String universityName;

    @Column(name = "university_passing_year")
    private Integer universityPassingYear;

    @Column(name = "university_gpa")
    private Double universityPassingGPA;

    // Getters and Setters

    public String getFullname() {
        return fullname;
    }
    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public int getRole() {
        return role;
    }
    public void setRole(int role) {
        this.role = role;
    }

    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }

    public String getSecondarySchool() {
        return secondarySchool;
    }
    public void setSecondarySchool(String secondarySchool) {
        this.secondarySchool = secondarySchool;
    }

    public Integer getSecondarySchoolPassingYear() {
        return secondarySchoolPassingYear;
    }
    public void setSecondarySchoolPassingYear(Integer secondarySchoolPassingYear) {
        this.secondarySchoolPassingYear = secondarySchoolPassingYear;
    }

    public Double getSecondarySchoolPercentage() {
        return secondarySchoolPercentage;
    }
    public void setSecondarySchoolPercentage(Double secondarySchoolPercentage) {
        this.secondarySchoolPercentage = secondarySchoolPercentage;
    }

    public String getHigherSecondarySchool() {
        return higherSecondarySchool;
    }
    public void setHigherSecondarySchool(String higherSecondarySchool) {
        this.higherSecondarySchool = higherSecondarySchool;
    }

    public Integer getHigherSecondaryPassingYear() {
        return higherSecondaryPassingYear;
    }
    public void setHigherSecondaryPassingYear(Integer higherSecondaryPassingYear) {
        this.higherSecondaryPassingYear = higherSecondaryPassingYear;
    }

    public Double getHigherSecondaryPercentage() {
        return higherSecondaryPercentage;
    }
    public void setHigherSecondaryPercentage(Double higherSecondaryPercentage) {
        this.higherSecondaryPercentage = higherSecondaryPercentage;
    }

    public String getUniversityName() {
        return universityName;
    }
    public void setUniversityName(String universityName) {
        this.universityName = universityName;
    }

    public Integer getUniversityPassingYear() {
        return universityPassingYear;
    }
    public void setUniversityPassingYear(Integer universityPassingYear) {
        this.universityPassingYear = universityPassingYear;
    }

    public Double getUniversityPassingGPA() {
        return universityPassingGPA;
    }
    public void setUniversityPassingGPA(Double universityPassingGPA) {
        this.universityPassingGPA = universityPassingGPA;
    }

    @Override
    public String toString() {
        return "Users [fullname=" + fullname + ", email=" + email + ", role=" + role + ", password=" + password
                + ", secondarySchool=" + secondarySchool + ", secondarySchoolPassingYear=" + secondarySchoolPassingYear
                + ", secondarySchoolPercentage=" + secondarySchoolPercentage + ", higherSecondarySchool="
                + higherSecondarySchool + ", higherSecondaryPassingYear=" + higherSecondaryPassingYear
                + ", higherSecondaryPercentage=" + higherSecondaryPercentage + ", universityName=" + universityName
                + ", universityPassingYear=" + universityPassingYear + ", universityPassingGPA=" + universityPassingGPA
                + "]";
    }
}
