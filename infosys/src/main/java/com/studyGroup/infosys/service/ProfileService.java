package com.studyGroup.infosys.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyGroup.infosys.model.Course;
import com.studyGroup.infosys.model.Profile;
import com.studyGroup.infosys.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private CourseService courseService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Optional<Profile> getProfileByEmail(String email) {
        return profileRepository.findByEmail(email);
    }

    public Profile saveOrUpdateProfile(Profile profile) {
       
        if (profile.getEnrolledCourseIds() == null) {
            profile.setEnrolledCourseIds("[]");
        }
        return profileRepository.save(profile);
    }


    public Profile enrollInCourse(String email, String courseId) { 
        Optional<Profile> profileOptional = profileRepository.findByEmail(email);
        Optional<Course> courseOptional = courseService.getCourseById(courseId);

        if (profileOptional.isPresent() && courseOptional.isPresent()) {
            Profile profile = profileOptional.get();
            try {
                Set<String> enrolledCourseIds;
                String enrolledCoursesJson = profile.getEnrolledCourseIds();

                if (enrolledCoursesJson == null || enrolledCoursesJson.isEmpty()) {
                    enrolledCourseIds = new HashSet<>();
                } else {
                    enrolledCourseIds = objectMapper.readValue(
                        enrolledCoursesJson,
                        new TypeReference<Set<String>>() {} 
                    );
                }

                enrolledCourseIds.add(courseId);
                profile.setEnrolledCourseIds(objectMapper.writeValueAsString(enrolledCourseIds));

                return profileRepository.save(profile);
            } catch (IOException e) {
               
                throw new RuntimeException("Could not update enrolled courses.", e);
            }
        }
        
        throw new RuntimeException("User profile or course not found.");
    }
}
