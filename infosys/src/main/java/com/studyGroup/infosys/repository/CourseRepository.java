package com.studyGroup.infosys.repository; // Added package declaration

import com.studyGroup.infosys.model.Course; // <-- Added import for Course
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * The CourseRepository interface provides the mechanism for storage, retrieval,
 * and search behavior for Course entities.
 * It extends JpaRepository, which gives us a number of CRUD (Create, Read, Update, Delete)
 * methods out-of-the-box for the Course entity.
 */
@Repository
public interface CourseRepository extends JpaRepository<Course, String> {
    // JpaRepository provides all the basic CRUD operations.
    // You can define custom query methods here if needed in the future.
    // For example: List<Course> findByInstructor(String instructor);
}

