package com.studyGroup.backend.controller; 

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.studyGroup.backend.model.Course;
import com.studyGroup.backend.service.CourseService;

import java.util.List;


@RestController
@RequestMapping("/api/courses") 
@CrossOrigin(origins = "*")
public class CourseController {

    @Autowired
    private CourseService courseService;

    
    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

   
    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable(value = "id") String courseId) {
        return courseService.getCourseById(courseId)
                .map(course -> ResponseEntity.ok().body(course))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Course createCourse(@RequestBody Course course) {
        return courseService.createCourse(course);
    }

  
    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable(value = "id") String courseId,
                                           @RequestBody Course courseDetails) {
        Course updatedCourse = courseService.updateCourse(courseId, courseDetails);
        if (updatedCourse == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedCourse);
    }

    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable(value = "id") String courseId) {
    
        return courseService.getCourseById(courseId)
                .map(course -> {
                    courseService.deleteCourse(courseId);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}

