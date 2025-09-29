package com.studyGroup.infosys.entity;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailManager {
	@Autowired
	JavaMailSender JMS;
	
	public String sendEmail(String toEmail, String subject, String message) {
		try {
		SimpleMailMessage mailMessage = new SimpleMailMessage();
		mailMessage.setFrom("balaganesh7944978@gmail.com");
		mailMessage.setTo(toEmail);
		mailMessage.setSubject(subject);
		mailMessage.setText(message);
		JMS.send(mailMessage);
		return "200::Password sent to the registered email";
		}
		catch(Exception e)
		{
			return "401::"+e.getMessage();	
		}
	}
}
