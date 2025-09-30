package com.studyGroup.infosys.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.studyGroup.infosys.model.User;

import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<User, Integer> {

    /**
     * Finds a user by their email address.
     * The service layer will use this method to fetch a user during the login process 
     * and then verify the password. This is a more secure and flexible approach.
     *
     * @param email The user's email.
     * @return An Optional containing the User if found, otherwise an empty Optional.
     */
    Optional<User> findByEmail(String email);

    /**
     * Checks if a user with the given email already exists in the database.
     * This is more efficient than fetching a count and returns a simple boolean.
     * It's perfect for validating emails during registration.
     *
     * @param email The email to check.
     * @return true if a user with the email exists, false otherwise.
     */
    boolean existsByEmail(String email);
}
