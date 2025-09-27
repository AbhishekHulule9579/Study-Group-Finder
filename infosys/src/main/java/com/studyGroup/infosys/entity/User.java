package com.studyGroup.infosys.entity;

import java.math.BigDecimal;

import java.time.Instant;
import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name="users")
public class User implements UserDetails{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String firstName;

    @Column(nullable=false)
    private String middleName;

    @Column(unique=true,nullable=false)
    private String email;

    @Column(nullable=false)
    private String password;

    @Column(nullable=false)
    private String phone;

    @Column(nullable=false)
    private String city;

    @Column(nullable=false)
    private String pincode;
    
    private String secondarySchool;
    private Integer secondarySchoolYear;

    @Column(precision=5,scale=2)
    private BigDecimal secondarySchoolPercentage;

    private String higherSecondarySchool;
    private Integer higherSecondaryPassingYear;

    @Column(precision=5,scale=2)
    private BigDecimal higherSecondaryPercentage;

    private String universityName;
    private Integer universityPassingYear;
    
    @Column(precision=4,scale=2)
    private BigDecimal universityPassingGPA;

    private String avatarUrl;

    @Builder.Default
    private String role="USER";

    @Builder.Default
    private boolean enabled=true;

    @CreationTimestamp
    @Column(updatable=false)
    private Date createdAt;

    @UpdateTimestamp
    private Date updatedAt;

    //Guys this is useful reset password 
    private String resetPasswordToken;
    private Instant resetPasswordExpiry;
    // this is JWT authentication
    

}