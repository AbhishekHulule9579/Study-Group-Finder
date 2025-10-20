package com.studyGroup.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.studyGroup.backend.dto.DashboardDTO;
import com.studyGroup.backend.model.User;
import com.studyGroup.backend.service.DashboardService;
import com.studyGroup.backend.service.JWTService;
import com.studyGroup.backend.service.UserService;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private UserService userService;

   
    @GetMapping
    public ResponseEntity<?> getDashboardData(@RequestHeader("Authorization") String authHeader) {
     
        String token = authHeader.substring(7);
        String email = jwtService.validateToken(token);

        if ("401".equals(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }

        try {
            User currentUser = userService.getUserProfile(token);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User associated with token not found.");
            }

            DashboardDTO dashboardData = dashboardService.getDashboardData(currentUser);

            return ResponseEntity.ok(dashboardData);

        } catch (Exception e) {
           
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while fetching dashboard data: " + e.getMessage());
        }
    }
}
