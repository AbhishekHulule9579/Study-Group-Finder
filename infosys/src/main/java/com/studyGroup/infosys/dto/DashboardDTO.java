package com.studyGroup.infosys.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DashboardDTO {
    private List<CourseSummaryDTO> myCourses;
    private List<GroupDTO> myGroups;
    private List<NotificationDTO> notifications;

    // Manual setters to prevent compilation issues in some environments
    public void setMyCourses(List<CourseSummaryDTO> myCourses) {
        this.myCourses = myCourses;
    }

    public void setMyGroups(List<GroupDTO> myGroups) {
        this.myGroups = myGroups;
    }

    public void setNotifications(List<NotificationDTO> notifications) {
        this.notifications = notifications;
    }
}
