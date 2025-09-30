package com.studyGroup.infosys.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    // Injects the 'spring.mail.username' property from your application.properties
    @Value("${spring.mail.username}")
    private String fromEmailAddress;

    /**
     * Sends a simple plain-text email.
     *
     * @param to      The recipient's email address.
     * @param subject The subject line of the email.
     * @param body    The plain-text content of the email.
     * @return A string indicating the status of the email sending process.
     */
    public String sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            // The 'from' address is now configured in application.properties
            mailMessage.setFrom(fromEmailAddress);
            mailMessage.setTo(to);
            mailMessage.setSubject(subject);
            mailMessage.setText(body);
            
            javaMailSender.send(mailMessage);
            
            return "200::Mail Sent Successfully";
        } catch (Exception e) {
            // It's good practice to log the full error for debugging in a real application
            System.err.println("Failed to send email: " + e.getMessage());
            return "500::Error sending email.";
        }
    }
}

