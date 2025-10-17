package com.studyGroup.infosys.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static final int EXPIRE_MINS = 5;

    private static class OtpData {
        String otp;
        LocalDateTime expiryTime;

        OtpData(String otp) {
            this.otp = otp;
            this.expiryTime = LocalDateTime.now().plusMinutes(EXPIRE_MINS);
        }

        boolean isExpired() {
            return LocalDateTime.now().isAfter(expiryTime);
        }
    }

    private final Map<String, OtpData> otpCache = new ConcurrentHashMap<>();
    private final Set<String> verifiedEmailsCache = ConcurrentHashMap.newKeySet();
    private final Set<String> passwordResetStartedCache = ConcurrentHashMap.newKeySet();
    private final Set<String> passwordChangeAuthorizedCache = ConcurrentHashMap.newKeySet();

    public String generateAndCacheOtp(String key) {
        Random random = new Random();
        String otp = String.valueOf(100000 + random.nextInt(900000));
        otpCache.put(key, new OtpData(otp));
        return otp;
    }

    public String getOtp(String key) {
        OtpData otpData = otpCache.get(key);
        if (otpData != null && !otpData.isExpired()) {
            return otpData.otp;
        }
        otpCache.remove(key); // remove expired or null
        return null;
    }

    public void clearOTP(String key) {
        otpCache.remove(key);
    }

    public boolean verifyOtp(String email, String otp) {
        String cachedOtp = getOtp(email);
        if (cachedOtp != null && cachedOtp.equals(otp)) {
            clearOTP(email);
            return true;
        }
        return false;
    }

    public void markEmailVerified(String email) {
        verifiedEmailsCache.add(email);
    }

    public boolean isEmailVerified(String email) {
        return verifiedEmailsCache.contains(email);
    }

    public void clearVerifiedEmail(String email) {
        verifiedEmailsCache.remove(email);
    }

    public void markResetStarted(String email) {
        passwordResetStartedCache.add(email);
    }

    public boolean isResetStarted(String email) {
        return passwordResetStartedCache.contains(email);
    }

    public void markPasswordChangeAuthorized(String email) {
        passwordChangeAuthorizedCache.add(email);
        passwordResetStartedCache.remove(email);
    }

    public boolean isPasswordChangeAuthorized(String email) {
        return passwordChangeAuthorizedCache.contains(email);
    }

    public void clearPasswordChangeAuthorization(String email) {
        passwordChangeAuthorizedCache.remove(email);
    }
}
