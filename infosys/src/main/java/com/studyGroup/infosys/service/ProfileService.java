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
        // When a new profile is created, initialize enrolled courses to an empty set
        if (profile.getEnrolledCourseIds() == null) {
            profile.setEnrolledCourseIds("[]");
        }
        return profileRepository.save(profile);
    }

    /**
     * Enrolls a user in a specific course.
     * @param email The email of the user to enroll.
     * @param courseId The ID of the course to enroll in.
     * @return The updated profile.
     * @throws RuntimeException if the user profile or course is not found.
     */
    public Profile enrollInCourse(String email, String courseId) { // <-- FIX: Changed to String
        Optional<Profile> profileOptional = profileRepository.findByEmail(email);
        Optional<Course> courseOptional = courseService.getCourseById(courseId); // <-- FIX: Now correctly passes a String

        if (profileOptional.isPresent() && courseOptional.isPresent()) {
            Profile profile = profileOptional.get();
            try {
                Set<String> enrolledCourseIds;
                String enrolledCoursesJson = profile.getEnrolledCourseIds();

                // Handle new users or users with no enrolled courses yet
                if (enrolledCoursesJson == null || enrolledCoursesJson.isEmpty()) {
                    enrolledCourseIds = new HashSet<>();
                } else {
                    enrolledCourseIds = objectMapper.readValue(
                        enrolledCoursesJson,
                        new TypeReference<Set<String>>() {} // <-- FIX: Changed to Set<String>
                    );
                }

                // Add the new course ID and save it back as a JSON string
                enrolledCourseIds.add(courseId);
                profile.setEnrolledCourseIds(objectMapper.writeValueAsString(enrolledCourseIds));

                return profileRepository.save(profile);
            } catch (IOException e) {
                // This would happen if the JSON is malformed, so we throw an exception
                throw new RuntimeException("Could not update enrolled courses.", e);
            }
        }
        
        // Throw an exception if the profile or course wasn't found
        throw new RuntimeException("User profile or course not found.");
    }
}
