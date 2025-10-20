package com.studyGroup.backend.service;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;


@Service
public class OtpService {

    private static final Integer EXPIRE_MINUTES = 5;
   
    private static final Integer AUTH_EXPIRE_MINUTES = 30; 
    
    private final Cache<String, String> otpCache; 
    private final Cache<String, Boolean> verifiedEmailCache; 
    
    private final Cache<String, Boolean> resetStartedCache;
    
   
    private final Cache<String, Boolean> passwordChangeAuthorizedCache; 

    public OtpService() {
       
        otpCache = CacheBuilder.newBuilder()
                .expireAfterWrite(EXPIRE_MINUTES, TimeUnit.MINUTES)
                .build();
        verifiedEmailCache = CacheBuilder.newBuilder()
                .expireAfterWrite(AUTH_EXPIRE_MINUTES, TimeUnit.MINUTES)
                .build();
                
        resetStartedCache = CacheBuilder.newBuilder()
                .expireAfterWrite(AUTH_EXPIRE_MINUTES, TimeUnit.MINUTES)
                .build();
        
        passwordChangeAuthorizedCache = CacheBuilder.newBuilder()
                .expireAfterWrite(EXPIRE_MINUTES, TimeUnit.MINUTES)
                .build();
    }

   
    public String generateAndCacheOtp(String key) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpCache.put(key, otp);
        return otp;
    }

    public String getOtp(String key) {
        return otpCache.getIfPresent(key);
    }

    public void clearOtp(String key) {
        otpCache.invalidate(key);
    }

    
    public boolean verifyOtp(String email, String otp) {
        String cachedOtp = getOtp(email);
        if (cachedOtp != null && cachedOtp.equals(otp)) {
            clearOtp(email);
            return true;
        }
        return false;
    }
    
  
     public void markEmailVerified(String email) {
        verifiedEmailCache.put(email, true);
     }

  
    public boolean isEmailVerified(String email) {
        return Boolean.TRUE.equals(verifiedEmailCache.getIfPresent(email));
    }

  
    public void clearVerifiedEmail(String email) {
        verifiedEmailCache.invalidate(email);
    }
    
    
    public void markResetStarted(String email) {
        resetStartedCache.put(email, true);
    }
    
  
    public boolean isResetStarted(String email) {
        return Boolean.TRUE.equals(resetStartedCache.getIfPresent(email));
    }
    
    
    public void markPasswordChangeAuthorized(String email) {
        passwordChangeAuthorizedCache.put(email, true);
        resetStartedCache.invalidate(email); 
    }
   
    public boolean isPasswordChangeAuthorized(String email) {
        return Boolean.TRUE.equals(passwordChangeAuthorizedCache.getIfPresent(email));
    }
    
    
    public void clearPasswordChangeAuthorization(String email) {
        passwordChangeAuthorizedCache.invalidate(email);
    }
}
