package com.studyGroup.infosys.controller;

import com.studyGroup.infosys.dto.LoginDto;
import com.studyGroup.infosys.dto.RegisterDto;
import com.studyGroup.infosys.entity.User;
import com.studyGroup.infosys.payload.ApiResponse;
import com.studyGroup.infosys.payload.JwtResponse;
import com.studyGroup.infosys.repository.UserRepository;
import com.studyGroup.infosys.service.impl.UserDetailsImpl;
import com.studyGroup.infosys.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000") // Allow requests from the React dev server
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterDto registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            // This is the corrected line, using a direct constructor to avoid type errors.
            return new ResponseEntity<>(new ApiResponse("Error: Email is already in use!"), HttpStatus.BAD_REQUEST);
        }

        // Create new user's account
        User user = User.builder()
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .phone(registerRequest.getPhone())
                .city(registerRequest.getCity())
                .pincode(registerRequest.getPincode())
                .secondarySchoolPercentage(registerRequest.getSecondarySchoolPercentage())
                .higherSecondaryPercentage(registerRequest.getHigherSecondaryPercentage())
                .avatarUrl(registerRequest.getAvatarUrl()) // <-- ADDED THIS LINE
                .build();

        userRepository.save(user);

        return ResponseEntity.ok(new ApiResponse("User registered successfully!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginDto loginRequest) {
        // ... (login logic remains the same)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtil.generateToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream().findFirst().get().getAuthority();

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                role));
    }
}

