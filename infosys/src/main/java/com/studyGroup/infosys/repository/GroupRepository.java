package com.studyGroup.infosys.repository;

import com.studyGroup.infosys.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    // Custom query to find groups by their privacy setting, ignoring case.
    List<Group> findAllByPrivacyIgnoreCase(String privacy);
}
