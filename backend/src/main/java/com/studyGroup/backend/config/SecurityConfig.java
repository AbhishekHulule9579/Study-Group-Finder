package com.studyGroup.backend.config;

import java.util.Arrays;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter authFilter;

    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            // Disable CSRF for API and SockJS endpoints (we use stateless JWT)
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth
                // Permit WebSocket handshake/info endpoints and app/topic used by STOMP/SockJS
                .requestMatchers(
                    "/ws/**",
                    "/ws/info/**",
                    "/topic/**",
                    "/app/**",
                    "/api/users/signin",
                    "/api/users/register/**",
                    "/api/users/forgot-password/**",
                    "/api/courses/**"
                ).permitAll()
                .requestMatchers("/api/documents/**").authenticated()

                .anyRequest().authenticated()
            )
            // Ensure sessions are stateless (required for JWT)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // The JWT filter runs before authentication attempts on protected routes
            .addFilterBefore(authFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        // CRITICAL FIX: Allow credentials (JWT header) for both REST and WebSocket
        configuration.setAllowCredentials(true); 
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}