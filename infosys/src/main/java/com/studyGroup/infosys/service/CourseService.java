package com.studyGroup.infosys.service;

import com.studyGroup.infosys.dto.CourseSummaryDTO;
import com.studyGroup.infosys.model.Course;
import com.studyGroup.infosys.model.User;
import com.studyGroup.infosys.repository.CourseRepository;
import com.studyGroup.infosys.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private UsersRepository usersRepository;

    public void addCourseToUser(String courseId, String username) {
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found"));
        User user = usersRepository.findByEmail(username).orElseThrow(() -> new RuntimeException("User not found"));
        user.getCourses().add(course);
        usersRepository.save(user);
    }
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public List<CourseSummaryDTO> getCoursesByUserId(Integer userId) {
        return courseRepository.findByUsers_Id(userId)
                .stream()
                .map(course -> new CourseSummaryDTO(course.getCourseId(), course.getCourseName(), course.getDescription()))
                .collect(Collectors.toList());
    }
}
