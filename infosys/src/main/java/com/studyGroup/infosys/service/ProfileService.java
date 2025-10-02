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

    /**
     * Helper method to safely parse the JSON string of enrolled course IDs into a Set.
     */
    private Set<String> getEnrolledCourseIdsAsSet(Profile profile) throws IOException {
        String enrolledCoursesJson = profile.getEnrolledCourseIds();
        if (enrolledCoursesJson == null || enrolledCoursesJson.isEmpty() || enrolledCoursesJson.equals("[]")) {
            return new HashSet<>();
        }
        return objectMapper.readValue(enrolledCoursesJson, new TypeReference<>() {});
    }


    public Profile enrollInCourse(String email, String courseId) {
        Profile profile = profileRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User profile not found."));

        // Ensure the course exists before trying to enroll
        courseService.getCourseById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found."));

        try {
            Set<String> enrolledCourseIds = getEnrolledCourseIdsAsSet(profile);
            enrolledCourseIds.add(courseId);
            profile.setEnrolledCourseIds(objectMapper.writeValueAsString(enrolledCourseIds));
            return profileRepository.save(profile);
        } catch (IOException e) {
            throw new RuntimeException("Could not update enrolled courses.", e);
        }
    }

    /**
     * Removes a course from the user's enrolled list.
     * @param email The email of the user.
     * @param courseId The ID of the course to un-enroll from.
     * @return The updated profile.
     */
    public Profile unenrollFromCourse(String email, String courseId) {
        Profile profile = profileRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User profile not found."));

        try {
            Set<String> enrolledCourseIds = getEnrolledCourseIdsAsSet(profile);

            if (enrolledCourseIds.remove(courseId)) { // remove() returns true if the element was present
                profile.setEnrolledCourseIds(objectMapper.writeValueAsString(enrolledCourseIds));
                return profileRepository.save(profile);
            } else {
                // If the course wasn't in the list, no need to save, just return the profile.
                return profile;
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not update enrolled courses.", e);
        }
    }
}
