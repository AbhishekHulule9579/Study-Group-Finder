package com.studyGroup.infosys.service;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

/**
 * Service to manage One-Time Passwords (OTPs) for email verification.
 * Uses Google Guava's Cache for time-based expiration.
 */
@Service
public class OtpService {

    private static final Integer EXPIRE_MINUTES = 5;
    private final Cache<String, String> otpCache; // Key: email, Value: OTP
    private final Cache<String, Boolean> verifiedEmailCache; // Key: email, Value: true (marks email as verified)

    public OtpService() {
        // Cache for storing OTPs with a 5-minute expiration
        otpCache = CacheBuilder.newBuilder()
                .expireAfterWrite(EXPIRE_MINUTES, TimeUnit.MINUTES)
                .build();
        // Cache to mark an email as verified, giving the user extra time to complete the profile form
        verifiedEmailCache = CacheBuilder.newBuilder()
                .expireAfterWrite(EXPIRE_MINUTES + 5, TimeUnit.MINUTES)
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
     * Verifies the provided OTP against the cached one. If successful, marks the email as verified.
     * @param email The user's email.
     * @param otp The OTP provided by the user.
     * @return true if the OTP is valid, false otherwise.
     */
    public boolean verifyOtp(String email, String otp) {
        String cachedOtp = getOtp(email);
        if (cachedOtp != null && cachedOtp.equals(otp)) {
            clearOtp(email);
            verifiedEmailCache.put(email, true);
            return true;
        }
        return false;
    }

    /**
     * Checks if an email has been successfully verified via OTP.
     * @param email The email address to check.
     * @return true if the email is in the verified cache, false otherwise.
     */
    public boolean isEmailVerified(String email) {
        return Boolean.TRUE.equals(verifiedEmailCache.getIfPresent(email));
    }

    /**
     * Clears the "verified" status of an email from the cache, typically after successful registration.
     * @param email The email address to clear.
     */
    public void clearVerifiedEmail(String email) {
        verifiedEmailCache.invalidate(email);
    }
}
