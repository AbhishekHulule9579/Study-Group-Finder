package com.studyGroup.infosys.dto;

// This DTO likely needs to be updated to include fields and getters
// based on the errors you received.
public class PasswordChangeRequest {
    private String email;
    private String otp;
    private String currentPassword;
    private String newPassword;

    // Getters
    public String getEmail() {
        return email;
    }

    public String getOtp() {
        return otp;
    }

    public String getCurrentPassword() {
        return currentPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    // Setters (optional, but good practice for Spring RequestBody)
    public void setEmail(String email) {
        this.email = email;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
