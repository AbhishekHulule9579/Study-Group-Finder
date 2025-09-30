package com.studyGroup.infosys.model;

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
@Table(name = "user") // Using lowercase 'user' as is conventional
@Data 
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "name")
    private String name;

    @Column(name = "email")
    private String email;
    
    // As discussed, ensure this 'role' column exists in your database table.
    @Column(name = "role") 
    private int role;

    @Column(name = "password")
    private String password;

    @Column(name = "secondarySchool")
    private String secondarySchool;

    @Column(name = "secondarySchoolPassingYear")
    private Integer secondarySchoolPassingYear;

    @Column(name = "secondarySchoolPercentage")
    private Double secondarySchoolPercentage;

    @Column(name = "higherSecondarySchool")
    private String higherSecondarySchool;

    @Column(name = "higherSecondaryPassingYear")
    private Integer higherSecondaryPassingYear;

    @Column(name = "higherSecondaryPercentage")
    private Double higherSecondaryPercentage;

    @Column(name = "universityName")
    private String universityName;

    @Column(name = "universityPassingYear")
    private Integer universityPassingYear;

    @Column(name = "universityPassingGPA")
    private Double universityPassingGPA;
}

