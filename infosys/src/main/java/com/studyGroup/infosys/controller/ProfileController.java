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
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*") // Using wildcard for now, can be restricted later
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private JWTService jwtService;

    /**
     * Gets the profile for the currently authenticated user.
     */
    @GetMapping
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String email = jwtService.validateToken(token);

        if ("401".equals(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }

        Optional<Profile> profileOptional = profileService.getProfileByEmail(email);

        // --- FIX: Replaced the functional chain with a clearer if/else block ---
        // This resolves the type mismatch error.
        if (profileOptional.isPresent()) {
            return ResponseEntity.ok(profileOptional.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Profile not found.");
        }
    }

    /**
     * Creates or updates the profile for the authenticated user.
     */
    @PostMapping
    public ResponseEntity<?> updateProfile(@RequestHeader("Authorization") String authHeader, @RequestBody Profile profileDetails) {
        String token = authHeader.substring(7);
        String email = jwtService.validateToken(token);

        if ("401".equals(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }

        // Ensure the profile being saved is for the authenticated user
        profileDetails.setEmail(email);
        Profile savedProfile = profileService.saveOrUpdateProfile(profileDetails);
        return ResponseEntity.ok(savedProfile);
    }

    /**
     * Endpoint to enroll the current user in a course.
     * @param authHeader The Authorization header containing the JWT.
     * @param courseId The ID of the course to enroll in, passed in the URL.
     * @return The updated profile on success, or an error response.
     */
    @PostMapping("/enroll/{courseId}")
    public ResponseEntity<?> enrollInCourse(@RequestHeader("Authorization") String authHeader, @PathVariable String courseId) {
        String token = authHeader.substring(7);
        String email = jwtService.validateToken(token);

        if ("401".equals(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }

        try {
            Profile updatedProfile = profileService.enrollInCourse(email, courseId);
            return ResponseEntity.ok(updatedProfile);
        } catch (RuntimeException e) {
             // Assuming the service throws an exception if the user or course is not found
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}

