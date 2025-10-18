package com.studyGroup.infosys.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "`user`") // Using backticks to handle the reserved 'user' keyword in SQL
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

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
    
    private boolean isVerified = false;

    // --- Spring Security UserDetails Implementation ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.isVerified;
    }

    // --- Critical Methods for Object Comparison ---

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

