package com.studyGroup.infosys.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.studyGroup.infosys.entity.Profile;
import com.studyGroup.infosys.entity.ProfileManager;

@RestController
@RequestMapping("/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    @Autowired
    ProfileManager profileManager;

    // Get profile for an authenticated user (by email)
    @PostMapping("/get")
    public Profile getProfile(@RequestBody Profile request) {
        Profile p = profileManager.getProfile(request.getEmail());
        if (p == null) {
        	
        	// Use a proper name from the Users table or from session
        	return new Profile(request.getEmail(), null, null, null, null, "[]", "User");

        }
        return p;
    }

    // Update profile for an authenticated user
    @PostMapping("/update")
    public String updateProfile(@RequestBody Profile profile) {
        profileManager.saveOrUpdateProfile(profile);
        return "200::Profile updated successfully";
    }
}
