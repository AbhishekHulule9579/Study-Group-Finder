package com.studyGroup.infosys.service.impl;

import com.studyGroup.infosys.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserDetailsImpl implements UserDetails {

    private final User user;

    public UserDetailsImpl(User user) {
        this.user = user;
    }

    /**
     * Exposes the user's database ID.
     * This is not part of the standard UserDetails interface but is needed for the JwtResponse.
     * @return The user's ID.
     */
    public Long getId() {
        return user.getId();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole()));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    //guys by using this mehod we are telling that user account never expire
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    //by using this we are telling that user's account will never locked
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    //by suing this it tells that user's password never expires
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    //guy's it tell that user cannot be disabled
    @Override
    public boolean isEnabled() {
        return user.isEnabled();
    }
}

