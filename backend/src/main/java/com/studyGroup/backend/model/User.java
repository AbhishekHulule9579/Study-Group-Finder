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

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
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

	public Double getUniversityGpa() {
		return universityGpa;
	}

	public void setUniversityGpa(Double universityGpa) {
		this.universityGpa = universityGpa;
	}

	public User(Integer id, String name, String email, int role, String password, String secondarySchool,
			Integer secondarySchoolPassingYear, Double secondarySchoolPercentage, String higherSecondarySchool,
			Integer higherSecondaryPassingYear, Double higherSecondaryPercentage, String universityName,
			Integer universityPassingYear, Double universityGpa) {
		super();
		this.id = id;
		this.name = name;
		this.email = email;
		this.role = role;
		this.password = password;
		this.secondarySchool = secondarySchool;
		this.secondarySchoolPassingYear = secondarySchoolPassingYear;
		this.secondarySchoolPercentage = secondarySchoolPercentage;
		this.higherSecondarySchool = higherSecondarySchool;
		this.higherSecondaryPassingYear = higherSecondaryPassingYear;
		this.higherSecondaryPercentage = higherSecondaryPercentage;
		this.universityName = universityName;
		this.universityPassingYear = universityPassingYear;
		this.universityGpa = universityGpa;
	}

	public User() {
		super();
	}
    
	
	
	
    
}

