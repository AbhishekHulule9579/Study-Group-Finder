package com.studyGroup.infosys.service;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {

    private static final Integer EXPIRE_MINS = 5;
    private Cache<String, String> otpCache;
    private Cache<String, String> resetTokenCache;
    //cache for storing registration otp
    private Cache<String, String> registrationOtpCache;
    //cache for storing user email during registration
    private Cache<String, String> userEmailCache;


    public OtpService(){
        super();
        otpCache = CacheBuilder.newBuilder().
                expireAfterWrite(EXPIRE_MINS, TimeUnit.MINUTES).build();
        resetTokenCache = CacheBuilder.newBuilder().
                expireAfterWrite(EXPIRE_MINS, TimeUnit.MINUTES).build();

        //for registration
        registrationOtpCache = CacheBuilder.newBuilder()
                .expireAfterWrite(EXPIRE_MINS, TimeUnit.MINUTES).build();
        userEmailCache = CacheBuilder.newBuilder()
                .expireAfterWrite(EXPIRE_MINS, TimeUnit.MINUTES).build();
    }


    public String generateOtp(String key){
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        String otpStr = String.valueOf(otp);
        otpCache.put(key, otpStr);
        return otpStr;
    }

    public String getOtp(String key){
        try{
            return otpCache.getIfPresent(key);
        }catch (Exception e){
            return null;
        }
    }

    public void clearOtp(String key){
        otpCache.invalidate(key);
    }
    public void generateAndCacheResetToken(String email, String token){
        resetTokenCache.put(email, token);
    }
    public String getResetToken(String email){
        return resetTokenCache.getIfPresent(email);
    }
    public void clearResetToken(String email){
        resetTokenCache.invalidate(email);
    }
    //for registration
    public String generateRegistrationOtp(String email) {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        String otpStr = String.valueOf(otp);
        registrationOtpCache.put(email, otpStr);
        return otpStr;
    }

    // Method to get cached registration OTP
    public String getRegistrationOtp(String email) {
        return registrationOtpCache.getIfPresent(email);
    }

    // Method to clear cached registration OTP
    public void clearRegistrationOtp(String email) {
        registrationOtpCache.invalidate(email);
    }
    // Method to cache user's email during registration
    public void cacheUserEmail(String otp, String email) {
        userEmailCache.put(otp, email);
    }

    // Method to get cached user's email during registration
    public String getUserEmail(String otp) {
        return userEmailCache.getIfPresent(otp);
    }

    // Method to clear cached user's email during registration
    public void clearUserEmail(String otp) {
        userEmailCache.invalidate(otp);
    }
}
