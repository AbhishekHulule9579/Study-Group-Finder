package com.studyGroup.infosys.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyGroup.infosys.dto.DashboardDTO;
import com.studyGroup.infosys.dto.SuggestedPeerDTO;
import com.studyGroup.infosys.model.Group;
import com.studyGroup.infosys.model.Profile;
import com.studyGroup.infosys.model.User;
import com.studyGroup.infosys.repository.ProfileRepository;
import com.studyGroup.infosys.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private GroupService groupService;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UsersRepository usersRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Gathers all necessary data for the user's dashboard.
     * @param currentUser The currently authenticated user.
     * @return A DashboardDTO containing groups, peers, and course count.
     */
    public DashboardDTO getDashboardData(User currentUser) throws IOException {
        // 1. Get the user's joined groups
        List<Group> joinedGroups = groupService.findGroupsByUserId(currentUser.getId());

        // 2. Get suggested peers
        List<SuggestedPeerDTO> suggestedPeers = getSuggestedPeers(currentUser);
        
        // 3. Get enrolled courses count
        Profile currentUserProfile = profileRepository.findByEmail(currentUser.getEmail())
                .orElse(new Profile()); // Create empty profile if not found
        Set<String> enrolledCourseIds = getEnrolledCourseIdsAsSet(currentUserProfile);


        // 4. Assemble the DTO
        return new DashboardDTO(joinedGroups, suggestedPeers, enrolledCourseIds.size());
    }

    /**
     * Finds and suggests peers based on the number of common courses.
     * @param currentUser The user for whom to suggest peers.
     * @return A list of suggested peers, sorted by the number of common courses.
     */
    private List<SuggestedPeerDTO> getSuggestedPeers(User currentUser) throws IOException {
        // Get the current user's profile and enrolled courses
        Profile currentUserProfile = profileRepository.findByEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Current user profile not found."));
        Set<String> currentUserCourses = getEnrolledCourseIdsAsSet(currentUserProfile);

        if (currentUserCourses.isEmpty()) {
            return Collections.emptyList(); // No courses, no suggestions
        }

        List<SuggestedPeerDTO> suggestions = new ArrayList<>();

        // Get all other users
        List<User> allOtherUsers = usersRepository.findAll().stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .collect(Collectors.toList());

        for (User otherUser : allOtherUsers) {
            Optional<Profile> otherUserProfileOpt = profileRepository.findByEmail(otherUser.getEmail());
            if (otherUserProfileOpt.isPresent()) {
                Set<String> otherUserCourses = getEnrolledCourseIdsAsSet(otherUserProfileOpt.get());

                // Find the intersection of the two sets to get common courses
                Set<String> commonCourses = new HashSet<>(currentUserCourses);
                commonCourses.retainAll(otherUserCourses);

                if (!commonCourses.isEmpty()) {
                    suggestions.add(new SuggestedPeerDTO(otherUser, commonCourses.size(), commonCourses));
                }
            }
        }

        // Sort suggestions: most common courses first
        suggestions.sort(Comparator.comparingInt(SuggestedPeerDTO::getCommonCoursesCount).reversed());

        return suggestions;
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
}
