package com.studyGroup.infosys.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyGroup.infosys.dto.DashboardDTO;
import com.studyGroup.infosys.dto.GroupDTO;
import com.studyGroup.infosys.dto.PeerUserDTO;
import com.studyGroup.infosys.dto.SuggestedPeerDTO;
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

    public DashboardDTO getDashboardData(User currentUser) throws IOException {

        List<GroupDTO> joinedGroups = groupService.findGroupsByUserId(currentUser.getId());

        List<SuggestedPeerDTO> suggestedPeers = getSuggestedPeers(currentUser);

        Profile currentUserProfile = profileRepository.findByEmail(currentUser.getEmail())
                .orElse(new Profile());
        Set<String> enrolledCourseIds = getEnrolledCourseIdsAsSet(currentUserProfile);

        return new DashboardDTO(joinedGroups, suggestedPeers, enrolledCourseIds.size());
    }


    private List<SuggestedPeerDTO> getSuggestedPeers(User currentUser) throws IOException {

        Profile currentUserProfile = profileRepository.findByEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Current user profile not found."));
        Set<String> currentUserCourses = getEnrolledCourseIdsAsSet(currentUserProfile);

        if (currentUserCourses.isEmpty()) {
            return Collections.emptyList();
        }

        List<SuggestedPeerDTO> suggestions = new ArrayList<>();

        List<User> allOtherUsers = usersRepository.findAll().stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .collect(Collectors.toList());

        for (User otherUser : allOtherUsers) {
            Optional<Profile> otherUserProfileOpt = profileRepository.findByEmail(otherUser.getEmail());
            if (otherUserProfileOpt.isPresent()) {
                Set<String> otherUserCourses = getEnrolledCourseIdsAsSet(otherUserProfileOpt.get());

                Set<String> commonCourses = new HashSet<>(currentUserCourses);
                commonCourses.retainAll(otherUserCourses);

                if (!commonCourses.isEmpty()) {
                    // This is the corrected line that uses the PeerUserDTO
                    suggestions.add(new SuggestedPeerDTO(PeerUserDTO.fromEntity(otherUser), commonCourses.size(), commonCourses));
                }
            }
        }

        suggestions.sort(Comparator.comparingInt(SuggestedPeerDTO::getCommonCoursesCount).reversed());

        return suggestions;
    }


    private Set<String> getEnrolledCourseIdsAsSet(Profile profile) throws IOException {
        String enrolledCoursesJson = profile.getEnrolledCourseIds();
        if (enrolledCoursesJson == null || enrolledCoursesJson.isEmpty() || enrolledCoursesJson.equals("[]")) {
            return new HashSet<>();
        }
        return objectMapper.readValue(enrolledCoursesJson, new TypeReference<>() {});
    }
}

