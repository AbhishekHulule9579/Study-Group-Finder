package com.studyGroup.infosys.entity;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.studyGroup.infosys.repository.UsersRepository;

@Service
public class UsersManager {

    @Autowired
    UsersRepository UR;
    @Autowired
    EmailManager EM;
    @Autowired
    JWTManager JWT;

    // Add user with check for email uniqueness
    public String addUsers(User U) {
        if (UR.validateEmail(U.getEmail()) > 0) {
            return "401::Email Id already existed";
        }
        UR.save(U);
        return "200::User Registered Successfully";
    }

    // Password recovery email
    public String recoverPassword(String email) {
        User U = UR.findById(email).orElse(null);
        if (U == null) {
            return "404::User not found";
        }
        String message = String.format("Dear %s \n\n Your Password is:%s", U.getFullname(), U.getPassword());
        return EM.sendEmail(U.getEmail(), "Study Group Finder Password Recovery", message);
    }

    // Validate email and password credentials, return JWT token on success
    public String validateCredentials(String email, String password) {
        if (UR.validatecredentials(email, password) > 0) {
            String token = JWT.generateToken(email);
            return "200::" + token;
        } else {
            return "401::Invalid Credentials";
        }
    }

    // Get full name from JWT token after validation
    public String getFullname(String token) {
        String email = JWT.validateToken(token);
        if ("401".equals(email)) {
            return "401::Token Expired";
        }
        User U = UR.findById(email).orElse(null);
        if (U == null) {
            return "404::User not found";
        }
        return U.getFullname();
    }
    
    public User getUserProfile(String token) {
        String email = JWT.validateToken(token);
        if ("401".equals(email)) {
            return null;  // or throw an Unauthorized exception
        }
        return UR.findById(email).orElse(null);
    }
    public String getEmail(String csrid) {
        String email = JWT.validateToken(csrid);
        if ("401".equals(email)) {
            return "401::Token Expired";
        }
        User user = UR.findById(email).orElse(null);
        if (user == null) {
            return "404::User not found";
        }
        return user.getEmail();  // return email (same as csrid)
    }


}

