package com.studyGroup.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.studyGroup.backend.model.Group;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
   
    List<Group> findAllByPrivacyIgnoreCase(String privacy);
}
