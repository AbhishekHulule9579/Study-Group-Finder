package com.studyGroup.backend.repository;

import com.studyGroup.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    // The generic types <User, Integer> match the entity type (User) and its ID type (Integer)
}