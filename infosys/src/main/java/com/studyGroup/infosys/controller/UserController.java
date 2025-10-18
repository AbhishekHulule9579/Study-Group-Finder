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

    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
    
        if (!otpService.isEmailVerified(user.getEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Email has not been verified. Please complete the OTP step.");
        }

        String response = userService.registerUser(user);
        if (response.startsWith("401")) { 
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email ID already exists.");
        }

        otpService.clearVerifiedEmail(user.getEmail());

        return ResponseEntity.ok("User Registered Successfully");
    }

    @PostMapping("/register/send-otp")
    public ResponseEntity<?> sendRegistrationOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (userService.userExists(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("An account with this email already exists.");
        }
        String otp = otpService.generateAndCacheOtp(email);

        String emailBody = "Hello " + request.getOrDefault("name", "there") + ",\n\n"
             + "Thank you for registering with Study Group Finder.\n\n"
             + "Your One-Time Password (OTP) is: " + otp + "\n\n"
             + "This OTP is valid for 5 minutes.\n\n"
             + "If you did not request this, please ignore this email.\n\n"
             + "Best regards,\nThe Study Group Finder Team";

        emailService.sendEmail(email, "Your OTP for Study Group Finder Registration", emailBody);

        return ResponseEntity.ok("OTP sent to your email address.");
    }

    
    @PostMapping("/register/verify-otp")
    public ResponseEntity<?> verifyRegistrationOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (otpService.verifyOtp(email, otp)) {
            otpService.markEmailVerified(email); 
            return ResponseEntity.ok("Email verified successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired OTP. Please try again.");
        }
    }
    
    
    /**
     * Corrected endpoint for initiating the forgot password process.
     * Calls the UserService to check user existence and generate/cache OTP.
     * The OTP is then used here to send the email notification.
     */
    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<String> sendForgotPasswordOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        
        try {
            // 1. Check user existence and generate OTP (throws UserNotRegisteredException if not found)
            String otp = userService.forgotPassword(email);
            
            // 2. Mark reset started
            otpService.markResetStarted(email);
            
            // 3. Send email to the registered user
            User user = userService.getUserByEmail(email).orElse(new User());
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
            
            String emailResponse = emailService.sendEmail(email, "Password Reset OTP for Study Group Finder", emailBody);

            if (emailResponse.startsWith("200")) {
                return ResponseEntity.ok("OTP sent to the registered email.");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(emailResponse.substring(6)); 
            }
            
        } catch (UserService.UserNotRegisteredException e) {
            // This exception is caught by the @ExceptionHandler below, returning a 404 NOT_FOUND.
            throw e;
        } catch (Exception e) {
            // Catch other unexpected errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing request: " + e.getMessage());
        }
    }

    /**
     * Dedicated exception handler to return a 404 NOT_FOUND when UserService
     * determines the user is not registered during the password reset attempt.
     */
    @ExceptionHandler(UserService.UserNotRegisteredException.class)
    public ResponseEntity<String> handleUserNotRegisteredException(UserService.UserNotRegisteredException ex) {
        // Returns the desired "User not registered. Please sign up first." message with 404 status.
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    
    
    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<Map<String, String>> verifyForgotPasswordOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        
        if (!otpService.isResetStarted(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Password reset process not initiated or session expired."));
        }

        if (otpService.verifyOtp(email, otp)) {
            otpService.markPasswordChangeAuthorized(email); 
            return ResponseEntity.ok(Map.of("message", "OTP verified. You can now set a new password."));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid or expired OTP. Please try again."));
        }
    }

    
    @PostMapping("/forgot-password/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody PasswordChangeRequest request) { // Changed to DTO
        
        if (!otpService.isPasswordChangeAuthorized(request.getEmail())) { // Use getter from DTO
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Authorization failed. Please verify the OTP again."));
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "New password must be at least 6 characters long."));
        }

        try {
            // NOTE: The request body for this endpoint is usually just email and newPassword,
            // but the userService.verifyOtpAndChangePassword expects DTO with email, otp, newPassword
            // Since we use otpService.isPasswordChangeAuthorized as pre-auth, we can simplify this call.
            // However, since we don't have the OTP in this request body, we must modify the DTO logic or service call.
            
            // OPTION 1: Call simplified service method (Preferred)
            userService.changePassword(request.getEmail(), request.getNewPassword());
            
            otpService.clearPasswordChangeAuthorization(request.getEmail()); // Use getter from DTO
            
            return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now log in with your new password."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Failed to reset password: " + e.getMessage()));
        }
    }
    
    // Rest of the controller methods remain the same

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody LoginRequest loginRequest) {
        String response = userService.validateCredentials(loginRequest.getEmail(), loginRequest.getPassword());
        
        if (response.startsWith("404")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("message", "User not registered. Please register first."));
        }
        if (response.startsWith("401")) { 
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "Invalid email or password."));
        }

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
