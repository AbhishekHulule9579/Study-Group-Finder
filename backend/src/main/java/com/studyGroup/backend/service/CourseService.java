package com.studyGroup.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.studyGroup.backend.model.Course;
import com.studyGroup.backend.repository.CourseRepository;

import java.util.List;
import java.util.Optional;


@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;


    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }


    public Optional<Course> getCourseById(String courseId) {
        return courseRepository.findById(courseId);
    }

    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }


    public Course updateCourse(String courseId, Course courseDetails) {
        return courseRepository.findById(courseId).map(course -> {
            course.setCourseName(courseDetails.getCourseName());
         
            course.setDescription(courseDetails.getDescription());
            return courseRepository.save(course);
        }).orElse(null);
    }

    public void deleteCourse(String courseId) {
        courseRepository.deleteById(courseId);
    }
}
