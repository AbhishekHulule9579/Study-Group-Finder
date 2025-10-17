package com.studyGroup.infosys.controller;

import com.studyGroup.infosys.dto.DashboardDTO;
import com.studyGroup.infosys.model.User;
import com.studyGroup.infosys.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        // The principal is the UserDetails object, which is our User class
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof User)) {
             // Handle cases where the principal is not our User object, e.g., a String on initial load
             return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid authentication principal.");
        }
        
        User user = (User) principal;

        // Pass the username (email) to the service layer
        DashboardDTO dashboardData = dashboardService.getDashboardData(user.getUsername());
        return ResponseEntity.ok(dashboardData);
    }
}
