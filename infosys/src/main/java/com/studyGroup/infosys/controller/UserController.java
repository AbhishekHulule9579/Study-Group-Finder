package com.studyGroup.infosys.controller;

import com.studyGroup.infosys.dto.LoginRequest;
import com.studyGroup.infosys.model.User;
import com.studyGroup.infosys.service.JWTService;
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
    
    // We need JWTService to validate tokens in our secure endpoints
    @Autowired
    private JWTService jwtService;

    /**
     * Endpoint for user registration.
     */
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody User user) {
        String response = userService.registerUser(user);
        if (response.startsWith("401")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email ID already exists.");
        }
        return ResponseEntity.ok("User Registered Successfully");
    }

    /**
     * Endpoint for initiating the password recovery process.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String response = userService.recoverPassword(email);
        if (response.startsWith("404")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        return ResponseEntity.ok("Password recovery instructions sent to the registered email.");
    }

    /**
     * Endpoint for user sign-in.
     */
    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody LoginRequest loginRequest) {
        String response = userService.validateCredentials(loginRequest.getEmail(), loginRequest.getPassword());
        if (response.startsWith("401")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Credentials");
        }
        String token = response.substring(5); // Removes "200::"
        return ResponseEntity.ok(Collections.singletonMap("token", token));
    }

    /**
     * Secure endpoint to fetch the profile of the currently logged-in user.
     */
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
    
    /**
     * Secure endpoint to update the academic details of the currently logged-in user.
     * @param authHeader The Authorization header containing the "Bearer" token.
     * @param userDetails The User object with updated details from the request body.
     * @return A response entity with the updated User object or an error message.
     */
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
}

