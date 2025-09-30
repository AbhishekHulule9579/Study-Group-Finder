package com.studyGroup.infosys.controller;

import com.studyGroup.infosys.model.Profile;
import com.studyGroup.infosys.service.JWTService;
import com.studyGroup.infosys.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile") // Standard API prefix
@CrossOrigin(origins = "*")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private JWTService jwtService;

    /**
     * Gets the profile for the currently authenticated user.
     * The user's identity is determined by the email within the JWT token.
     */
    @GetMapping // Correct HTTP method for getting data
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        // Extract token from "Bearer <token>"
        String token = authHeader.substring(7);
        String email = jwtService.validateToken(token);

        if ("401".equals(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }

        Optional<Profile> profileOptional = profileService.getProfileByEmail(email);

        // **FIXED LOGIC**: Using a clear if/else block to avoid the type mismatch.
        if (profileOptional.isPresent()) {
            return ResponseEntity.ok(profileOptional.get()); // Returns ResponseEntity<Profile>
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Profile not found."); // Returns ResponseEntity<String>
        }
    }

    /**
     * Creates or updates the profile for the authenticated user.
     * It uses the email from the token to ensure a user can only edit their own profile.
     */
    @PostMapping // Correct HTTP method for creating/updating data
    public ResponseEntity<?> updateProfile(@RequestHeader("Authorization") String authHeader, @RequestBody Profile profileDetails) {
        String token = authHeader.substring(7);
        String email = jwtService.validateToken(token);

        if ("401".equals(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }

        // Security check: Force the email in the profile data to match the token's email
        profileDetails.setEmail(email);

        Profile savedProfile = profileService.saveOrUpdateProfile(profileDetails);
        
        // Return the saved profile object with a 200 OK status
        return ResponseEntity.ok(savedProfile);
    }
}

