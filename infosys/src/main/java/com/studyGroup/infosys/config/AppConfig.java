package com.studyGroup.infosys.config;

import com.studyGroup.infosys.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@Configuration
@RequiredArgsConstructor
public class AppConfig {

    private final UsersRepository usersRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        // This bean provides the service to load user-specific data.
        // It is now correctly injected into the AuthenticationProvider in SecurityConfig.
        return username -> usersRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
    }

    // All other beans (AuthenticationProvider, AuthenticationManager, PasswordEncoder)
    // have been moved to SecurityConfig.java to resolve the duplicate bean definition error.
}

