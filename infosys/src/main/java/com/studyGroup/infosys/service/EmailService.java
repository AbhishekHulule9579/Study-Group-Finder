package com.studyGroup.infosys.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException; // Import specific MailException
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmailAddress;

    public String sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
          
            mailMessage.setFrom(fromEmailAddress);
            mailMessage.setTo(to);
            mailMessage.setSubject(subject);
            mailMessage.setText(body);
            
            javaMailSender.send(mailMessage);
            
            return "200::Mail Sent Successfully";
        } catch (MailException e) { // Catch specific MailException like AuthenticationFailedException
           
            // Log the detailed error message for debugging
            System.err.println("Failed to send email to " + to + ". MailException Reason: " + e.getMessage());
            e.printStackTrace(); // Print stack trace to see root cause (e.g., failed authentication)
            
            // Return 500 status message for the controller to handle
            return "500::Error sending email. Check server logs for MailException details.";
        } catch (Exception e) {
            // Catch any other unforeseen runtime exceptions
            System.err.println("An unexpected error occurred during email sending: " + e.getMessage());
            e.printStackTrace(); // Print full stack trace for deep debugging
            return "500::Unexpected error during email sending.";
        }
    }
}
