package com.studyGroup.infosys.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmailAddress;

    /**
     * Sends a simple plain text email with detailed error logging.
     *
     * @param to      The recipient's email address.
     * @param subject The subject of the email.
     * @param text    The body content of the email.
     */
    public void sendSimpleMessage(String to, String subject, String text) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();

            mailMessage.setFrom(fromEmailAddress);
            mailMessage.setTo(to);
            mailMessage.setSubject(subject);
            mailMessage.setText(text);

            javaMailSender.send(mailMessage);

        } catch (MailException e) {
            String errorMessage = "Failed to send email to " + to + ". MailException Reason: " + e.getMessage();
            System.err.println("************************************************************************");
            System.err.println("EMAIL ERROR DETECTED: " + errorMessage);
            e.printStackTrace();
            System.err.println("************************************************************************");
        } catch (Exception e) {
            String errorMessage = "An unexpected error occurred during email sending: " + e.getMessage();
            System.err.println("UNEXPECTED EMAIL ERROR: " + errorMessage);
            e.printStackTrace();
        }
    }

    /**
     * Sends a pre-formatted OTP email.
     *
     * @param to  The recipient's email address.
     * @param otp The One-Time Password to be sent.
     */
    public void sendOtpEmail(String to, String otp) {
        String subject = "Your OTP for Study Group Finder";
        String body = "Your One-Time Password is: " + otp + "\n\nThis OTP will expire in 10 minutes.";
        sendSimpleMessage(to, subject, body);
    }
}

