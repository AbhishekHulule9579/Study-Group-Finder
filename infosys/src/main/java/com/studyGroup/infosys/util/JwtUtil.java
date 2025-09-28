package com.studyGroup.infosys.util;

// Correct imports for JWT, SLF4J Logger, and Spring Security
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {
    //logger is used for the logging
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    //it is secret key
    @Value("${app.jwtSecret}")
    private String jwtSecret;

    //it will tell the token lifespan
    @Value("${app.jwtExpirationMs}")
    private int jwtExpirationMs;

    //it is creating secret key
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    //create new JWT token
    //get userdetail-->start building (Jwts.builder)-->set subject -->set time of token expiration-->sign token(HS512)-->finalize(compact)
    public String generateToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs)) // <-- Corrected: Removed extra semicolon
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    //used for reading token
    public String getEmailFromJwtToken(String token) {
        // Corrected: parserBuilder() and setSigningKey()
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            // Corrected: setSigningKey()
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }
}

