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

    public String sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
          
            mailMessage.setFrom(fromEmailAddress);
            mailMessage.setTo(to);
            mailMessage.setSubject(subject);
            mailMessage.setText(body);
            
            javaMailSender.send(mailMessage);
            
            return "200::Mail Sent Successfully";
        } catch (MailException e) { 
           
            String errorMessage = "Failed to send email to " + to + ". MailException Reason: " + e.getMessage();
            System.err.println("************************************************************************");
            System.err.println("EMAIL ERROR DETECTED: " + errorMessage);
            e.printStackTrace(); 
            System.err.println("************************************************************************");
            
            return "500::Error sending email. Detailed Error: " + e.getMessage();
        } catch (Exception e) {
            String errorMessage = "An unexpected error occurred during email sending: " + e.getMessage();
            System.err.println("UNEXPECTED EMAIL ERROR: " + errorMessage);
            e.printStackTrace();
            return "500::Unexpected error during email sending. Detailed Error: " + e.getMessage();
        }
    }
}
