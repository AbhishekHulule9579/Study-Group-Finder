package com.studyGroup.infosys.service;

import com.studyGroup.infosys.model.Profile;
import com.studyGroup.infosys.model.User;
import com.studyGroup.infosys.repository.ProfileRepository;
import com.studyGroup.infosys.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Optional;


@Service
public class UserService implements UserDetailsService {

    private final UsersRepository usersRepository;
    private final ProfileRepository profileRepository;
    private final EmailService emailService;
    private final JWTService jwtService;
    private final PasswordEncoder passwordEncoder;

    // Using Constructor Injection to break the circular dependency
    @Autowired
    public UserService(UsersRepository usersRepository,
                       ProfileRepository profileRepository,
                       EmailService emailService,
                       JWTService jwtService,
                       @Lazy PasswordEncoder passwordEncoder) {
        this.usersRepository = usersRepository;
        this.profileRepository = profileRepository;
        this.emailService = emailService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return usersRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
    }


    public Optional<User> getUserByEmail(String email) {
        return usersRepository.findByEmail(email);
    }
    
    public User findByEmail(String email) {
        return usersRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }


    public boolean userExists(String email) {
        return usersRepository.existsByEmail(email);
    }

    public User registerUser(User user) {
        if (usersRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email Id already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = usersRepository.save(user);

        Profile profile = new Profile();
        profile.setEmail(user.getEmail());
        profile.setFullname(user.getFirstName() + " " + user.getLastName());
        profileRepository.save(profile);

        // Send a welcome email
        emailService.sendSimpleMessage(user.getEmail(), "Welcome to Study Group Finder!", "Thank you for registering. We're excited to have you on board!");

        return savedUser;
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
        String email = jwtService.extractUsername(token);
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
     public User save(User user) {
        return usersRepository.save(user);
    }
}

