package com.studyGroup.infosys.controller;

import com.studyGroup.infosys.dto.LoginRequest;
import com.studyGroup.infosys.dto.PasswordChangeRequest;
import com.studyGroup.infosys.model.User;
import com.studyGroup.infosys.service.EmailService;
import com.studyGroup.infosys.service.JWTService;
import com.studyGroup.infosys.service.OtpService;
import com.studyGroup.infosys.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private JWTService jwtService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    /**
     * Final step of registration. Creates the user only if their email has been verified via OTP.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        // 1. Check if email has been verified in the cache
        if (!otpService.isEmailVerified(user.getEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Email has not been verified. Please complete the OTP step.");
        }

        // 2. Proceed with user registration
        String response = userService.registerUser(user);
        if (response.startsWith("401")) { // Should not happen if the send-otp logic is correct, but for safety
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email ID already exists.");
        }

        // 3. Clear the verified status from cache after successful registration
        otpService.clearVerifiedEmail(user.getEmail());

        return ResponseEntity.ok("User Registered Successfully");
    }

    /**
     * First step of registration. Sends an OTP if the email is not already registered.
     */
    @PostMapping("/register/send-otp")
    public ResponseEntity<?> sendRegistrationOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (userService.userExists(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("An account with this email already exists.");
        }
        String otp = otpService.generateAndCacheOtp(email);

        // Customize email body
        String emailBody = "Hello " + request.getOrDefault("name", "there") + ",\n\n"
                + "Thank you for registering with Study Group Finder.\n\n"
                + "Your One-Time Password (OTP) is: " + otp + "\n\n"
                + "This OTP is valid for 5 minutes.\n\n"
                + "If you did not request this, please ignore this email.\n\n"
                + "Best regards,\nThe Study Group Finder Team";

        emailService.sendEmail(email, "Your OTP for Study Group Finder", emailBody);

        return ResponseEntity.ok("OTP sent to your email address.");
    }

    /**
     * Second step of registration. Verifies the OTP provided by the user.
     */
    @PostMapping("/register/verify-otp")
    public ResponseEntity<?> verifyRegistrationOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (otpService.verifyOtp(email, otp)) {
            return ResponseEntity.ok("Email verified successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired OTP. Please try again.");
        }
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String response = userService.recoverPassword(email);
        if (response.startsWith("404")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        return ResponseEntity.ok("Password recovery instructions sent to the registered email.");
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody LoginRequest loginRequest) {
        String response = userService.validateCredentials(loginRequest.getEmail(), loginRequest.getPassword());
        
        // This logic ensures the correct HTTP status is sent for each case.
        if (response.startsWith("404")) { // User not found
            // This returns HTTP 404 Not Found, which the frontend needs to see.
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("message", "User not registered. Please register first."));
        }
        if (response.startsWith("401")) { // Invalid credentials (wrong password)
            // *** THIS IS THE CRUCIAL FIX ***
            // This now correctly returns HTTP 401 Unauthorized for wrong passwords.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "Invalid email or password."));
        }

        // If successful, the response is "200::token"
        String token = response.substring(5);
        return ResponseEntity.ok(Collections.singletonMap("token", token));
    }
    
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing Authorization header.");
        }
        String token = authHeader.substring(7);
        User userProfile = userService.getUserProfile(token);
        if (userProfile == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }
        return ResponseEntity.ok(userProfile);
    }
    

    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(@RequestHeader("Authorization") String authHeader, @RequestBody User userDetails) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing Authorization header.");
        }
        String token = authHeader.substring(7);
        String email = jwtService.validateToken(token);
        
        if ("401".equals(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }

        User updatedUser = userService.updateUser(email, userDetails);

        if (updatedUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/verify-password")
    public ResponseEntity<?> verifyPassword(@RequestHeader("Authorization") String authHeader, @RequestBody PasswordChangeRequest request) {
        String token = authHeader.substring(7);
        String email = jwtService.validateToken(token);

        if ("401".equals(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }

        boolean isCorrect = userService.verifyPassword(email, request.getCurrentPassword());

        if (isCorrect) {
            return ResponseEntity.ok(Map.of("message", "Password verified."));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Current password does not match."));
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestHeader("Authorization") String authHeader, @RequestBody PasswordChangeRequest request) {
        String token = authHeader.substring(7);
        String email = jwtService.validateToken(token);

        if ("401".equals(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "New password must be at least 6 characters long."));
        }

        userService.changePassword(email, request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }
}
