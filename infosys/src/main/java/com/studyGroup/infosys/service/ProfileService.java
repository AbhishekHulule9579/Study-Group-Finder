package com.studyGroup.infosys.service;

import com.studyGroup.infosys.model.Profile;
import com.studyGroup.infosys.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    
    public Optional<Profile> getProfileByEmail(String email) {
        return profileRepository.findByEmail(email);
    }

    public Profile saveOrUpdateProfile(Profile profile) {
        return profileRepository.save(profile);
    }
}
