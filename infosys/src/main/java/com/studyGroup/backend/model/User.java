package com.studyGroup.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name")
    private String name;

    @Column(name = "email", unique = true, nullable = false)
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
    private Double universityGpa;
}

