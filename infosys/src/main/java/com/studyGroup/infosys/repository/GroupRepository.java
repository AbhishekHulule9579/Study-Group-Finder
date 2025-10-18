package com.studyGroup.infosys.repository;

import com.studyGroup.infosys.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
   
    List<Group> findAllByPrivacyIgnoreCase(String privacy);
}
