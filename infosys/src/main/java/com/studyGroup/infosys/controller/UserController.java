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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;


import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private OtpService otpService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JWTService jwtService;
    @Autowired
    private PasswordEncoder passwordEncoder;


    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (!otpService.isEmailVerified(user.getEmail())) {
            return ResponseEntity.badRequest().body("Email not verified.");
        }
        if (userService.isUserExist(user.getEmail())) {
            return ResponseEntity.badRequest().body("User with this email already exists.");
        }
        User registeredUser = userService.registerUser(user.getFirstName(), user.getLastName(), user.getEmail(), user.getPassword());

        otpService.clearVerifiedEmail(user.getEmail());

        return ResponseEntity.ok(registeredUser);
    }
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestParam String email) {
        if (userService.isUserExist(email)) {
            return ResponseEntity.badRequest().body("User with this email already exists.");
        }
        String otp = otpService.generateAndCacheOtp(email);
        try {
            emailService.sendOtpEmail(email, otp);
            return ResponseEntity.ok("OTP sent to your email.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send OTP.");
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        if (otpService.verifyOtp(email, otp)) {
            otpService.markEmailVerified(email);
            return ResponseEntity.ok("Email verified successfully.");
        } else {
            return ResponseEntity.badRequest().body("Invalid OTP.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtService.generateToken(userDetails);

            Map<String, String> response = new HashMap<>();
            response.put("token", jwt);
            response.put("message", "Login successful");

            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        if (!userService.isUserExist(email)) {
            return ResponseEntity.badRequest().body("No user found with this email.");
        }
        String otp = otpService.generateAndCacheOtp(email);
        try {
            emailService.sendOtpEmail(email, otp);
            otpService.markResetStarted(email);
            return ResponseEntity.ok("OTP sent to your email for password reset.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send OTP.");
        }
    }

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<?> verifyResetOtp(@RequestParam String email, @RequestParam String otp) {
        if (!otpService.isResetStarted(email)) {
            return ResponseEntity.badRequest().body("Password reset not initiated for this email.");
        }
        if (otpService.verifyOtp(email, otp)) {
            otpService.markPasswordChangeAuthorized(email);
            return ResponseEntity.ok("OTP verified. You can now change your password.");
        } else {
            return ResponseEntity.badRequest().body("Invalid OTP.");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordChangeRequest request) {
        if (!otpService.isPasswordChangeAuthorized(request.getEmail())) {
            return ResponseEntity.badRequest().body("Not authorized to change password. Please verify OTP first.");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body("Passwords do not match.");
        }

        User user = userService.findByEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userService.save(user);

        otpService.clearPasswordChangeAuthorization(request.getEmail());

        return ResponseEntity.ok("Password has been reset successfully.");
    }
}
