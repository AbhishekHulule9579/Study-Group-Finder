package com.studyGroup.infosys.entity;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.studyGroup.infosys.repository.ProfileRepository;

import java.util.Optional;

@Service
public class ProfileManager {

    @Autowired
    ProfileRepository profileRepo;

    public Profile getProfile(String email) {
        return profileRepo.findByEmail(email);
    }

    public Profile saveOrUpdateProfile(Profile profile) {
        return profileRepo.save(profile); // will update if exists, create if not
    }
}
