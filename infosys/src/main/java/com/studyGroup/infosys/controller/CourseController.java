package com.studyGroup.infosys.controller; // Added package declaration

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// --- Imports updated to match your project structure ---
import com.studyGroup.infosys.model.Course;
import com.studyGroup.infosys.service.CourseService;


/**
 * The CourseController class handles all incoming HTTP requests related to courses.
 * It acts as the entry point for our REST API.
 */
@RestController
@RequestMapping("/api/courses") // Base URL for all endpoints in this controller
@CrossOrigin(origins = "*") // Allows requests from any frontend
public class CourseController {

    @Autowired
    private CourseService courseService;

    /**
     * Handles GET requests to /api/courses
     * @return A list of all courses.
     */
    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    /**
     * Handles GET requests to /api/courses/{id}
     * @param courseId The ID of the course to retrieve.
     * @return A ResponseEntity containing the course if found, or a 404 Not Found status.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable(value = "id") String courseId) {
        return courseService.getCourseById(courseId)
                .map(course -> ResponseEntity.ok().body(course))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Handles POST requests to /api/courses
     * @param course The Course object to be created, passed in the request body.
     * @return The newly created course.
     */
    @PostMapping
    public Course createCourse(@RequestBody Course course) {
        return courseService.createCourse(course);
    }

    /**
     * Handles PUT requests to /api/courses/{id}
     * @param courseId The ID of the course to update.
     * @param courseDetails The updated course data from the request body.
     * @return A ResponseEntity containing the updated course, or a 404 Not Found status.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable(value = "id") String courseId,
                                           @RequestBody Course courseDetails) {
        Course updatedCourse = courseService.updateCourse(courseId, courseDetails);
        if (updatedCourse == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedCourse);
    }

    /**
     * Handles DELETE requests to /api/courses/{id}
     * @param courseId The ID of the course to delete.
     * @return A ResponseEntity with a success (200 OK) or not found (404) status.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable(value = "id") String courseId) {
        // First, check if the course exists
        return courseService.getCourseById(courseId)
                .map(course -> {
                    courseService.deleteCourse(courseId);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}

