package com.studyGroup.infosys.controller;

import com.studyGroup.infosys.model.Course;
import com.studyGroup.infosys.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:5173")
public class CourseController {
    @Autowired
    private CourseService courseService;

    @GetMapping
    public List<Course> getAllCourses(){
        return courseService.getAllCourses();
    }

    @PostMapping("/{courseId}/add")
    public ResponseEntity<?> addCourseToUser(@PathVariable Integer courseId, Authentication authentication){
        String username = authentication.getName();
        courseService.addCourseToUser(courseId, username);
        return ResponseEntity.ok("Course added to user successfully");
    }
}
