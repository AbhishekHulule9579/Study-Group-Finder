package com.studyGroup.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyGroup.backend.model.Course;
import com.studyGroup.backend.model.Profile;
import com.studyGroup.backend.repository.ProfileRepository;

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
        // This method correctly uses the repository to fetch the Profile by email.
        return profileRepository.findByEmail(email);
    }

    /**
     * Saves or updates the provided Profile entity.
     * This method correctly acts as the persistence layer.
     *
     * @param profile The Profile entity to save.
     * @return The saved Profile entity.
     */
    public Profile saveOrUpdateProfile(Profile profile) {
        // The calling Controller (ProfileController) is responsible for ensuring 
        // fields like 'aboutMe' are validated and cleaned before passing the entity here.
        return profileRepository.save(profile);
    }

    
    /**
     * Helper to deserialize the JSON string of enrolled course IDs into a Java Set.
     */
    private Set<String> getEnrolledCourseIdsAsSet(Profile profile) throws IOException {
        String enrolledCoursesJson = profile.getEnrolledCourseIds();
        if (enrolledCoursesJson == null || enrolledCoursesJson.isEmpty() || enrolledCoursesJson.equals("[]")) {
            return new HashSet<>();
        }
        return objectMapper.readValue(enrolledCoursesJson, new TypeReference<Set<String>>() {});
    }


    public Profile enrollInCourse(String email, String courseId) {
        Profile profile = profileRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User profile not found."));

        // Validate that the course exists before enrolling
        courseService.getCourseById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found."));

        try {
            Set<String> enrolledCourseIds = getEnrolledCourseIdsAsSet(profile);
            
            // Enrollment logic
            if (!enrolledCourseIds.contains(courseId)) {
                enrolledCourseIds.add(courseId);
                profile.setEnrolledCourseIds(objectMapper.writeValueAsString(enrolledCourseIds));
                return profileRepository.save(profile);
            }
            // Return existing profile if already enrolled
            return profile;
        } catch (IOException e) {
            throw new RuntimeException("Could not update enrolled courses due to a data processing error.", e);
        }
    }

    public Profile unenrollFromCourse(String email, String courseId) {
        Profile profile = profileRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User profile not found."));

        try {
            Set<String> enrolledCourseIds = getEnrolledCourseIdsAsSet(profile);

            if (enrolledCourseIds.remove(courseId)) { 
                profile.setEnrolledCourseIds(objectMapper.writeValueAsString(enrolledCourseIds));
                return profileRepository.save(profile);
            } else {
                // Return existing profile if not enrolled in that course
                return profile;
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not update enrolled courses due to a data processing error.", e);
        }
    }
}