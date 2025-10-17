package com.studyGroup.infosys.controller;

import com.studyGroup.infosys.dto.DashboardDTO;
import com.studyGroup.infosys.model.User;
import com.studyGroup.infosys.service.DashboardService;
import com.studyGroup.infosys.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserService userService;


    @GetMapping
    public ResponseEntity<?> getDashboardData() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        try {
            User currentUser = userService.getUserByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

            DashboardDTO dashboardData = dashboardService.getDashboardData(currentUser);
            return ResponseEntity.ok(dashboardData);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while fetching dashboard data: " + e.getMessage());
        }
    }
}
