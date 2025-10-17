package com.studyGroup.infosys.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.Set;

@Entity
@Table(name = "`user`") // Using backticks because 'user' can be a reserved keyword in SQL
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String firstName;
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    @Column(name = "role")
    private int role;

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

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "user_courses",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "course_id"))
    private Set<Course> courses;

    @OneToMany(mappedBy = "creator")
    private Set<Group> createdGroups;

    @OneToMany(mappedBy = "user")
    private Set<GroupMember> groupMemberships;


    // --- UserDetails Implementation ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Here you could map your `role` field to different authorities
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getUsername() {
        // Spring Security's "username" is our email
        return this.email;
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
        return true;
    }
}

