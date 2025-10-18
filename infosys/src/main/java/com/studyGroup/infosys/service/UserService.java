package com.studyGroup.infosys.service;

import com.studyGroup.infosys.dto.PasswordChangeRequest;
import com.studyGroup.infosys.model.Profile;
import com.studyGroup.infosys.model.User;
import com.studyGroup.infosys.repository.ProfileRepository;
import com.studyGroup.infosys.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
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
    private OtpService otpService; // Needed for OTP generation and validation

    @Autowired
    private JWTService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Custom exception for when a user is not found during a process that requires registration
    public static class UserNotRegisteredException extends RuntimeException {
        public UserNotRegisteredException(String message) {
            super(message);
        }
    }
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> userOptional = usersRepository.findByEmail(username);
        if (userOptional.isEmpty()) {
            throw new UsernameNotFoundException("User not found with email: " + username);
        }
        User user = userOptional.get();
        
        // Using an empty list for authorities for simplicity, consistent with the original code structure
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

    /**
     * Initiates the forgot password process.
     * 1. Checks if the user exists.
     * 2. If exists, generates and caches an OTP.
     * @param email The email of the user attempting to reset the password.
     * @return The generated OTP string.
     * @throws UserNotRegisteredException if the user is not found.
     */
    public String forgotPassword(String email) {
        Optional<User> userOptional = usersRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            // Throw a specific exception to be handled by the controller
            throw new UserNotRegisteredException("User not registered. Please sign up first.");
        }

        // User found, proceed with OTP generation and caching
        String otp = otpService.generateAndCacheOtp(email);
        return otp; // Return the OTP for the controller to send via email
    }

    /**
     * Verifies the OTP and updates the user's password if successful.
     * NOTE: This method now correctly uses the getters from PasswordChangeRequest.
     * @param request DTO containing email, OTP, and new password.
     * @return A success message.
     * @throws RuntimeException if OTP is invalid or user is not found during the final step.
     */
    public String verifyOtpAndChangePassword(PasswordChangeRequest request) {
        // Assuming your PasswordChangeRequest has getEmail() and getOtp() and getNewPassword()
        if (!otpService.verifyOtp(request.getEmail(), request.getOtp())) {
            throw new RuntimeException("Invalid or expired OTP.");
        }

        User user = usersRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found for password change."));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        usersRepository.save(user);

        // Assuming clearOtp(email) is used to remove the cached OTP and reset start flags
        // Since you seem to use custom methods like clearPasswordChangeAuthorization,
        // let's stick to the simplest clear OTP for now, or ensure your OtpService has a matching method.
        // I will assume OtpService has clearOtp(String email) as a general cleanup method.
        otpService.clearOtp(request.getEmail()); 
        return "Password reset successfully.";
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
