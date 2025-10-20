package com.studyGroup.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.studyGroup.backend.model.Profile;
import com.studyGroup.backend.model.User;
import com.studyGroup.backend.repository.ProfileRepository;
import com.studyGroup.backend.repository.UsersRepository;

import java.util.ArrayList;
import java.util.Optional;


@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private EmailService emailService;
    
    @Autowired
    private JWTService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> userOptional = usersRepository.findByEmail(username);
        if (userOptional.isEmpty()) {
            throw new UsernameNotFoundException("User not found with email: " + username);
        }
        User user = userOptional.get();
        
        return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), new ArrayList<>());
    }
    
    
    public Optional<User> getUserByEmail(String email) {
        return usersRepository.findByEmail(email);
    }

    public boolean userExists(String email) {
        return usersRepository.existsByEmail(email);
    }

    public String registerUser(User user) {
        if (usersRepository.existsByEmail(user.getEmail())) {
            return "401::Email Id already exists";
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        usersRepository.save(user);

        Profile profile = new Profile();
        profile.setEmail(user.getEmail());
        profile.setFullname(user.getName());
        profileRepository.save(profile);
        
        return "200::User Registered Successfully";
    }

 
    public String validateCredentials(String email, String password) {
        Optional<User> userOptional = usersRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                String token = jwtService.generateToken(email);
                return "200::" + token;
            } else {
                return "401::Invalid Credentials";
            }
        }
        return "404::User not found";
    }

    
    public User getUserProfile(String token) {
        String email = jwtService.validateToken(token);
        if ("401".equals(email)) {
            return null;
        }
        return usersRepository.findByEmail(email).orElse(null);
    }
    
    
    public User updateUser(String email, User userDetails) {
        Optional<User> userOptional = usersRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User existingUser = userOptional.get();

            existingUser.setSecondarySchool(userDetails.getSecondarySchool());
            existingUser.setSecondarySchoolPassingYear(userDetails.getSecondarySchoolPassingYear());
            existingUser.setSecondarySchoolPercentage(userDetails.getSecondarySchoolPercentage());
            existingUser.setHigherSecondarySchool(userDetails.getHigherSecondarySchool());
            existingUser.setHigherSecondaryPassingYear(userDetails.getHigherSecondaryPassingYear());
            existingUser.setHigherSecondaryPercentage(userDetails.getHigherSecondaryPercentage());
            existingUser.setUniversityName(userDetails.getUniversityName());
            existingUser.setUniversityPassingYear(userDetails.getUniversityPassingYear());
          
            existingUser.setUniversityGpa(userDetails.getUniversityGpa());

            return usersRepository.save(existingUser);
        }
        return null;
    }

    public boolean verifyPassword(String email, String currentPassword) {
        Optional<User> userOptional = usersRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            return passwordEncoder.matches(currentPassword, user.getPassword());
        }
        return false;
    }

    public void changePassword(String email, String newPassword) {
        Optional<User> userOptional = usersRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            usersRepository.save(user);
        } else {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
    }
}
