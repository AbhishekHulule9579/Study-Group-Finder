package com.studyGroup.infosys.controller;

import com.studyGroup.infosys.dto.DashboardDTO;
import com.studyGroup.infosys.model.User;
import com.studyGroup.infosys.service.DashboardService;
import com.studyGroup.infosys.service.JWTService;
import com.studyGroup.infosys.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    /**
     * Endpoint to get all data required for the main dashboard view.
     * @param authHeader The Authorization header containing the user's JWT.
     * @return A ResponseEntity containing the DashboardDTO.
     */
    @GetMapping
    public ResponseEntity<?> getDashboardData(@RequestHeader("Authorization") String authHeader) {
        // 1. Extract and validate the token from the header
        String token = authHeader.substring(7);
        String email = jwtService.validateToken(token);

        if ("401".equals(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }

        try {
            // 2. Fetch the full User object for the authenticated user
            User currentUser = userService.getUserProfile(token);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User associated with token not found.");
            }

            // 3. Call the DashboardService to aggregate all the data
            DashboardDTO dashboardData = dashboardService.getDashboardData(currentUser);

            // 4. Return the complete dashboard data object with a 200 OK status
            return ResponseEntity.ok(dashboardData);

        } catch (Exception e) {
            // Catch any other exceptions (e.g., from file reading, etc.)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while fetching dashboard data: " + e.getMessage());
        }
    }
}
