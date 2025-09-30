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

    /**
     * Retrieves a user's profile by their email.
     * @param email The email of the user.
     * @return An Optional containing the Profile if found, or an empty Optional otherwise.
     */
    public Optional<Profile> getProfileByEmail(String email) {
        return profileRepository.findByEmail(email);
    }

    /**
     * Saves a new profile or updates an existing one.
     * The JpaRepository's save method handles both create and update operations.
     * @param profile The profile object to save.
     * @return The saved profile entity.
     */
    public Profile saveOrUpdateProfile(Profile profile) {
        return profileRepository.save(profile);
    }
}
