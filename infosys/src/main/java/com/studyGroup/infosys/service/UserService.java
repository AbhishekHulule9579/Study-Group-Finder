package com.studyGroup.infosys.service;

import com.studyGroup.infosys.model.User;
import com.studyGroup.infosys.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Optional;

// **STEP 1**: Implement the UserDetailsService interface
@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UsersRepository usersRepository;
    
    @Autowired
    private EmailService emailService; 
    
    @Autowired
    private JWTService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * **STEP 2**: Implement the required method from UserDetailsService.
     * This method is the bridge between our User model and Spring Security.
     * It tells Spring Security how to find a user by their username (in our case, email).
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> userOptional = usersRepository.findByEmail(username);
        if (userOptional.isEmpty()) {
            throw new UsernameNotFoundException("User not found with email: " + username);
        }
        User user = userOptional.get();
        // Return a standard Spring Security User object.
        return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), new ArrayList<>());
    }

    /**
     * Registers a new user. The user's password is now securely hashed before being saved.
     */
    public String registerUser(User user) {
        if (usersRepository.existsByEmail(user.getEmail())) {
            return "401::Email Id already exists";
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        usersRepository.save(user);
        return "200::User Registered Successfully";
    }

    /**
     * Handles user login by securely comparing the provided password with the stored hash.
     */
    public String validateCredentials(String email, String password) {
        Optional<User> userOptional = usersRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                String token = jwtService.generateToken(email);
                return "200::" + token;
            }
        }
        return "401::Invalid Credentials";
    }

    /**
     * Retrieves a user's profile based on a JWT token.
     */
    public User getUserProfile(String token) {
        String email = jwtService.validateToken(token);
        if ("401".equals(email)) {
            return null;
        }
        return usersRepository.findByEmail(email).orElse(null);
    }
    
    /**
     * Recovers a user's password.
     */
    public String recoverPassword(String email) {
        Optional<User> userOptional = usersRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return "404::User not found";
        }
        User user = userOptional.get();
        String message = String.format("Dear %s,\n\nA password recovery request was initiated for your account. If you did not request this, you can safely ignore this email.", user.getName());
        return emailService.sendEmail(user.getEmail(), "Study Group Finder Password Recovery Request", message);
    }
    
    /**
     * Updates the academic details of an existing user.
     */
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
            existingUser.setUniversityPassingGPA(userDetails.getUniversityPassingGPA());

            return usersRepository.save(existingUser);
        }
        return null; // User not found
    }
}

