package com.studyGroup.infosys.controller;

import com.studyGroup.infosys.dto.DashboardDTO;
import com.studyGroup.infosys.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

        String userEmail;
        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails) {
            // This is the standard Spring Security principal
            userEmail = ((UserDetails) principal).getUsername();
        } else {
             // Fallback if the principal is just the username string
            userEmail = principal.toString();
        }
        
        // Pass the username (which is the email in our case) to the service layer
        DashboardDTO dashboardData = dashboardService.getDashboardData(userEmail);
        return ResponseEntity.ok(dashboardData);
    }
}
