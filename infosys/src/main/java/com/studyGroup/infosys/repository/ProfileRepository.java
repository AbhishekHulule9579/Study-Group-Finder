package com.studyGroup.infosys.repository;

import com.studyGroup.infosys.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Profile, String> {
    Profile findByEmail(String email);
}
