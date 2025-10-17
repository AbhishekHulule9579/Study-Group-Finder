package com.studyGroup.infosys.service;

import com.studyGroup.infosys.dto.CourseSummaryDTO;
import com.studyGroup.infosys.dto.DashboardDTO;
import com.studyGroup.infosys.dto.GroupDTO;
import com.studyGroup.infosys.dto.NotificationDTO;
import com.studyGroup.infosys.model.User;
import com.studyGroup.infosys.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

    @Autowired
    private CourseService courseService;

    @Autowired
    private GroupService groupService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UsersRepository usersRepository;

    public DashboardDTO getDashboardData(String username) {
        User user = usersRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
        Integer userId = user.getId();

        List<CourseSummaryDTO> myCourses = courseService.getCoursesByUserId(userId);
        List<GroupDTO> myGroups = groupService.getGroupsForUser(username);
        List<NotificationDTO> notifications = notificationService.getNotificationsForUser(user);

        DashboardDTO dashboardDTO = new DashboardDTO();
        dashboardDTO.setMyCourses(myCourses);
        dashboardDTO.setMyGroups(myGroups);
        dashboardDTO.setNotifications(notifications);

        return dashboardDTO;
    }
}
