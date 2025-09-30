package com.studyGroup.infosys.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

@Service
public class JWTService {

    // These values are injected from your application.properties file for better security and configuration.
    @Value("${jwt.secret}")
    private String secretKeyString;

    @Value("${jwt.expiration.ms}")
    private long expirationTime;

    private SecretKey getSigningKey() {
        // Creates a secure key from the secret string in your properties file.
        return Keys.hmacShaKeyFor(secretKeyString.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generates a JWT token for a given email (subject).
     */
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email) // Using the standard 'subject' claim for the user identifier
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime)) // Correctly adds expiration time
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Validates a token and returns the email (subject) from it.
     * Returns "401" if the token is expired or invalid in any way.
     */
    public String validateToken(String token) {
        try {
            // This single line handles parsing and validation. 
            // If the token is expired or the signature is wrong, it will throw an exception.
            return getClaimFromToken(token, Claims::getSubject);
        } catch (Exception e) {
            // Any exception during parsing means the token is invalid.
            return "401";
        }
    }

    /**
     * A generic helper function to extract a specific claim from a token.
     */
    private <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claimsResolver.apply(claims);
    }
}

