package com.studyGroup.infosys.controller;

import com.studyGroup.infosys.model.Profile;
import com.studyGroup.infosys.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<?> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        Optional<Profile> profileOptional = profileService.getProfileByEmail(email);

        if (profileOptional.isPresent()) {
            return ResponseEntity.ok(profileOptional.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Profile not found.");
        }
    }

    @PostMapping
    public ResponseEntity<?> updateProfile(@RequestBody Profile profileDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        profileDetails.setEmail(email);
        Profile savedProfile = profileService.saveOrUpdateProfile(profileDetails);
        return ResponseEntity.ok(savedProfile);
    }

    @PostMapping("/enroll/{courseId}")
    public ResponseEntity<?> enrollInCourse(@PathVariable String courseId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        try {
            Profile updatedProfile = profileService.enrollInCourse(email, courseId);
            return ResponseEntity.ok(updatedProfile);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }


    @DeleteMapping("/unenroll/{courseId}")
    public ResponseEntity<?> unenrollFromCourse(@PathVariable String courseId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        try {
            Profile updatedProfile = profileService.unenrollFromCourse(email, courseId);
            return ResponseEntity.ok(updatedProfile);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}

