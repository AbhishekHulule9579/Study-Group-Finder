package com.studyGroup.infosys.service; // Added package declaration

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.studyGroup.infosys.model.Course; // <-- Added import for Course
import com.studyGroup.infosys.repository.CourseRepository; 

import java.util.List;     // <-- Added import for List
import java.util.Optional; // <-- Added import for Optional

/**
 * The CourseService class contains the business logic for operations
 * related to courses. It uses the CourseRepository to interact with the
 * database.
 */
@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    /**
     * Retrieves all courses from the database.
     * @return A list of all courses.
     */
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    /**
     * Retrieves a single course by its ID.
     * @param courseId The ID of the course to retrieve.
     * @return An Optional containing the course if found, or an empty Optional otherwise.
     */
    public Optional<Course> getCourseById(String courseId) {
        return courseRepository.findById(courseId);
    }

    /**
     * Creates and saves a new course.
     * @param course The course object to be saved.
     * @return The saved course object.
     */
    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    /**
     * Updates an existing course.
     * @param courseId The ID of the course to update.
     * @param courseDetails The new details for the course.
     * @return The updated course object, or null if the course was not found.
     */
    public Course updateCourse(String courseId, Course courseDetails) {
        return courseRepository.findById(courseId).map(course -> {
            course.setCourseName(courseDetails.getCourseName());
            course.setInstructor(courseDetails.getInstructor());
            course.setDescription(courseDetails.getDescription());
            return courseRepository.save(course);
        }).orElse(null);
    }

    /**
     * Deletes a course by its ID.
     * @param courseId The ID of the course to delete.
     */
    public void deleteCourse(String courseId) {
        courseRepository.deleteById(courseId);
    }
}

