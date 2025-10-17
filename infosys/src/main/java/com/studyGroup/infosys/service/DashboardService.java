package com.studyGroup.infosys.service;

import com.studyGroup.infosys.dto.CourseSummaryDTO;
import com.studyGroup.infosys.dto.DashboardDTO;
import com.studyGroup.infosys.dto.GroupDTO;
import com.studyGroup.infosys.dto.NotificationDTO;
import com.studyGroup.infosys.model.User;
import com.studyGroup.infosys.repository.UsersRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class DashboardService {
    private final CourseService courseService;
    private final GroupService groupService;
    private final NotificationService notificationService;
    private final UsersRepository usersRepository;


    public DashboardDTO getDashboardData(String username) {
        User user = usersRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
        Integer userId = user.getId();

        List<CourseSummaryDTO> myCourses = courseService.getCoursesByUserId(userId);
        List<GroupDTO> myGroups = groupService.findGroupsByUserId(userId);
        List<NotificationDTO> notifications = notificationService.getNotificationsForUser(username);

        DashboardDTO dashboardDTO = new DashboardDTO();
        dashboardDTO.setMyCourses(myCourses);
        dashboardDTO.setMyGroups(myGroups);
        dashboardDTO.setNotifications(notifications);
        return dashboardDTO;
    }
}
