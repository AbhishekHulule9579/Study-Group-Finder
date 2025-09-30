package com.studyGroup.infosys.repository;

import com.studyGroup.infosys.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, String> {

  
    Optional<Profile> findByEmail(String email);
}

