package com.studyGroup.infosys.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService; 
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; 

import com.studyGroup.infosys.entity.User;
import com.studyGroup.infosys.repository.UserRepository;

@Service

public class UserDetailsServiceImpl implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository; 

    @Override
    
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with this email: " + email));

        return new UserDetailsImpl(user);
    }
}


//flowchart of this code 
//receive email-->check in database if email present-->Handled user not found-->use spring security (UserDetailsImpl)-->then return spring security(UserDetailsImpl)