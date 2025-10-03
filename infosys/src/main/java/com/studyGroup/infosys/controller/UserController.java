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
import java.util.Optional;

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

        emailService.sendEmail(email, "Your OTP for Study Group Finder Registration", emailBody);

        return ResponseEntity.ok("OTP sent to your email address.");
    }

    /**
     * Second step of registration. Verifies the OTP provided by the user.
     * FIX: Added call to markEmailVerified() after successful OTP verification.
     */
    @PostMapping("/register/verify-otp")
    public ResponseEntity<?> verifyRegistrationOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (otpService.verifyOtp(email, otp)) {
            // *** CRITICAL FIX: Mark email as verified for the registration process ***
            otpService.markEmailVerified(email); 
            return ResponseEntity.ok("Email verified successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired OTP. Please try again.");
        }
    }
    
    // --- START: NEW FORGOT PASSWORD/OTP FLOW ---

    /**
     * Step 1 of Password Reset. Sends an OTP to the user's email if they exist.
     * This endpoint fixes the 404 error from the previous attempt.
     */
    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<String> sendForgotPasswordOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        
        Optional<User> userOptional = userService.getUserByEmail(email);
        if (userOptional.isEmpty()) {
            // This returns HTTP 404 Not Found, matching the required behavior for non-existent users.
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found or email not registered.");
        }
        
        User user = userOptional.get();
        String otp = otpService.generateAndCacheOtp(email);
        
        // Use Optional.ofNullable to safely retrieve the name, preventing a NullPointerException (the silent crash)
        String userName = Optional.ofNullable(user.getName()).orElse("there");

        String emailBody = String.format(
            "Hello %s,\n\n"
            + "We received a request to reset your password. \n\n"
            + "Your One-Time Password (OTP) is: %s\n\n"
            + "This OTP is valid for 5 minutes. Do not share it with anyone.\n\n"
            + "If you did not request this, please ignore this email.\n\n"
            + "Best regards,\nThe Study Group Finder Team",
            userName, otp
        );
        
        // This is the call that may still fail due to external configuration (App Password/Firewall)
        String emailResponse = emailService.sendEmail(email, "Password Reset OTP for Study Group Finder", emailBody);
        
        if (emailResponse.startsWith("200")) {
            // Use the cache to mark that an OTP process has started for this email
            otpService.markResetStarted(email); 
            return ResponseEntity.ok("OTP sent to the registered email.");
        } else {
            // Forward the specific error message generated by EmailService's logging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(emailResponse.substring(6)); 
        }
    }

    /**
     * Step 2 of Password Reset. Verifies the OTP.
     */
    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<Map<String, String>> verifyForgotPasswordOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        
        // Check if a reset was even initiated (optional security layer)
        if (!otpService.isResetStarted(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Password reset process not initiated or session expired."));
        }

        if (otpService.verifyOtp(email, otp)) {
            // After successful verification, mark the email as ready for password change
            otpService.markPasswordChangeAuthorized(email); 
            return ResponseEntity.ok(Map.of("message", "OTP verified. You can now set a new password."));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid or expired OTP. Please try again."));
        }
    }

    /**
     * Step 3 of Password Reset. Changes the password if authorized.
     */
    @PostMapping("/forgot-password/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        
        // 1. Check if the user is authorized to change the password (OTP verified)
        if (!otpService.isPasswordChangeAuthorized(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Authorization failed. Please verify the OTP again."));
        }

        if (newPassword == null || newPassword.length() < 6) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "New password must be at least 6 characters long."));
        }

        try {
            userService.changePassword(email, newPassword);
            
            // 2. Clear authorization status after successful password change
            otpService.clearPasswordChangeAuthorization(email);
            
            return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now log in with your new password."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Failed to reset password: " + e.getMessage()));
        }
    }
    
    // --- END: NEW FORGOT PASSWORD/OTP FLOW ---


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
