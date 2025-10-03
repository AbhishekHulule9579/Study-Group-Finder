package com.studyGroup.infosys.service;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

/**
 * Service to manage One-Time Passwords (OTPs) for email verification and password reset.
 * Uses Google Guava's Cache for time-based expiration.
 */
@Service
public class OtpService {

    private static final Integer EXPIRE_MINUTES = 5;
    // INCREASED AUTH time to 30 minutes to allow time for the user to complete the profile form.
    private static final Integer AUTH_EXPIRE_MINUTES = 30; 
    
    private final Cache<String, String> otpCache; // Key: email, Value: OTP (Used for registration/reset)
    
    // Used for registration flow (email has verified OTP, allowing user to continue to profile creation)
    private final Cache<String, Boolean> verifiedEmailCache; 
    
    // Used for password reset flow (user requested OTP)
    private final Cache<String, Boolean> resetStartedCache;
    
    // Used for password reset flow (OTP was successfully verified, authorizing password change)
    private final Cache<String, Boolean> passwordChangeAuthorizedCache; 

    public OtpService() {
        // Cache for storing OTPs with a 5-minute expiration
        otpCache = CacheBuilder.newBuilder()
                .expireAfterWrite(EXPIRE_MINUTES, TimeUnit.MINUTES)
                .build();
                
        // Cache to mark an email as verified for registration
        verifiedEmailCache = CacheBuilder.newBuilder()
                .expireAfterWrite(AUTH_EXPIRE_MINUTES, TimeUnit.MINUTES)
                .build();
                
        // Cache to mark that a password reset OTP was sent for an email
        resetStartedCache = CacheBuilder.newBuilder()
                .expireAfterWrite(AUTH_EXPIRE_MINUTES, TimeUnit.MINUTES)
                .build();
        
        // Cache to mark an email as authorized for password change
        passwordChangeAuthorizedCache = CacheBuilder.newBuilder()
                .expireAfterWrite(EXPIRE_MINUTES, TimeUnit.MINUTES)
                .build();
    }

    /**
     * Generates a 6-digit OTP, caches it, and returns it.
     * @param key The email address to associate the OTP with.
     * @return The generated 6-digit OTP.
     */
    public String generateAndCacheOtp(String key) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpCache.put(key, otp);
        return otp;
    }

    /**
     * Retrieves an OTP from the cache if it exists and hasn't expired.
     * @param key The email address.
     * @return The OTP string or null if not found.
     */
    public String getOtp(String key) {
        return otpCache.getIfPresent(key);
    }

    /**
     * Removes an OTP from the cache.
     * @param key The email address.
     */
    public void clearOtp(String key) {
        otpCache.invalidate(key);
    }

    /**
     * Verifies the provided OTP against the cached one. This is a common check.
     * NOTE: It no longer marks any cache (verifiedEmailCache or passwordChangeAuthorizedCache).
     * The controller method calling this method must handle marking the correct cache based on the flow (registration vs reset).
     * @param email The user's email.
     * @param otp The OTP provided by the user.
     * @return true if the OTP is valid, false otherwise.
     */
    public boolean verifyOtp(String email, String otp) {
        String cachedOtp = getOtp(email);
        if (cachedOtp != null && cachedOtp.equals(otp)) {
            clearOtp(email);
            return true;
        }
        return false;
    }
    
    // --- NEW METHOD FOR REGISTRATION FLOW ---
    /**
     * Marks an email as verified for registration after successful OTP check.
     */
     public void markEmailVerified(String email) {
        verifiedEmailCache.put(email, true);
     }

    // --- Registration Flow Methods ---

    /**
     * Checks if an email has been successfully verified via OTP (for registration).
     */
    public boolean isEmailVerified(String email) {
        return Boolean.TRUE.equals(verifiedEmailCache.getIfPresent(email));
    }

    /**
     * Clears the "verified" status of an email from the cache, typically after successful registration.
     */
    public void clearVerifiedEmail(String email) {
        verifiedEmailCache.invalidate(email);
    }
    
    // --- Password Reset Flow Methods ---
    
    /**
     * Marks that a password reset process has been successfully initiated (OTP sent).
     */
    public void markResetStarted(String email) {
        resetStartedCache.put(email, true);
    }
    
    /**
     * Checks if a password reset process has been initiated for this email.
     */
    public boolean isResetStarted(String email) {
        return Boolean.TRUE.equals(resetStartedCache.getIfPresent(email));
    }
    
    /**
     * Marks an email as authorized to change password (after OTP verification).
     */
    public void markPasswordChangeAuthorized(String email) {
        passwordChangeAuthorizedCache.put(email, true);
        resetStartedCache.invalidate(email); // Clear reset start flag after verification
    }
    
    /**
     * Checks if an email is authorized to change password.
     */
    public boolean isPasswordChangeAuthorized(String email) {
        return Boolean.TRUE.equals(passwordChangeAuthorizedCache.getIfPresent(email));
    }
    
    /**
     * Clears the password change authorization status.
     */
    public void clearPasswordChangeAuthorization(String email) {
        passwordChangeAuthorizedCache.invalidate(email);
    }
}
