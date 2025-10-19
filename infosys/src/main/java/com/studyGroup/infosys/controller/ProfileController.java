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
@CrossOrigin(origins = "*")
public class ProfileController {

    // Assuming the maximum length for aboutMe is 2000 characters based on standard practice for ~255 words.
    private static final int ABOUT_ME_MAX_LENGTH = 2000;

    @Autowired
    private ProfileService profileService;

    @Autowired
    private JWTService jwtService;

    @GetMapping
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String email = jwtService.validateToken(token);

        if ("401".equals(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }

        Optional<Profile> profileOptional = profileService.getProfileByEmail(email);
        
        if (profileOptional.isPresent()) {
            return ResponseEntity.ok(profileOptional.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Profile not found.");
        }
    }

    /**
     * Updates the user's profile information by safely merging fields 
     * from the request body onto the existing profile entity.
     */
    @PostMapping
    public ResponseEntity<?> updateProfile(@RequestHeader("Authorization") String authHeader, @RequestBody Profile profileDetails) {
        String token = authHeader.substring(7);
        String email = jwtService.validateToken(token);

        if ("401".equals(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }

        Optional<Profile> profileOptional = profileService.getProfileByEmail(email);
        
        if (profileOptional.isEmpty()) {
             return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Profile not found for update.");
        }

        Profile existingProfile = profileOptional.get();

        // --- SAFE MERGE LOGIC ---
        // Only update fields if they are explicitly present (non-null) in the request body.
        
        if (profileDetails.getFullname() != null) {
            existingProfile.setFullname(profileDetails.getFullname());
        }
        if (profileDetails.getProfilePicUrl() != null) {
            existingProfile.setProfilePicUrl(profileDetails.getProfilePicUrl());
        }
        if (profileDetails.getPhone() != null) {
            existingProfile.setPhone(profileDetails.getPhone());
        }
        if (profileDetails.getGithubUrl() != null) {
            existingProfile.setGithubUrl(profileDetails.getGithubUrl());
        }
        if (profileDetails.getLinkedinUrl() != null) {
            existingProfile.setLinkedinUrl(profileDetails.getLinkedinUrl());
        }
        
        // NEW: Handle the 'aboutMe' field and perform server-side validation.
        if (profileDetails.getAboutMe() != null) {
            String aboutMe = profileDetails.getAboutMe();
            if (aboutMe.length() > ABOUT_ME_MAX_LENGTH) {
                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("About Me content exceeds the " + ABOUT_ME_MAX_LENGTH + " character limit.");
            }
            existingProfile.setAboutMe(aboutMe);
        }

        // Ensure the email remains correct before saving
        existingProfile.setEmail(email); 
        
        Profile updatedProfile = profileService.saveOrUpdateProfile(existingProfile);
        return ResponseEntity.ok(updatedProfile);
    }

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
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    
    @DeleteMapping("/unenroll/{courseId}")
    public ResponseEntity<?> unenrollFromCourse(@RequestHeader("Authorization") String authHeader, @PathVariable String courseId) {
        String token = authHeader.substring(7);
        String email = jwtService.validateToken(token);

        if ("401".equals(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }

        try {
            Profile updatedProfile = profileService.unenrollFromCourse(email, courseId);
            return ResponseEntity.ok(updatedProfile);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
