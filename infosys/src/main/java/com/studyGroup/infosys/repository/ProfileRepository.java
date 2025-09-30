package com.studyGroup.infosys.repository;

import com.studyGroup.infosys.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, String> {

    /**
     * By returning Optional<Profile>, we make it explicit that a profile
     * may not be found for a given email. This is safer than returning null.
     */
    Optional<Profile> findByEmail(String email);
}

