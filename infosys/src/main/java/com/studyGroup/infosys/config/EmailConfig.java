package com.studyGroup.infosys.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

/**
 * Explicitly configures the JavaMailSender bean by reading properties directly,
 * avoiding dependency injection conflicts with MailProperties auto-configuration
 * which sometimes fails to load correctly alongside a custom configuration.
 */
@Configuration
public class EmailConfig {

    @Value("${spring.mail.host}")
    private String host;
    
    @Value("${spring.mail.port}")
    private int port;

    @Value("${spring.mail.username}")
    private String username;
    
    @Value("${spring.mail.password}")
    private String password;
    
    @Value("${spring.mail.protocol}")
    private String protocol;

    // Direct injection for mail properties is usually simpler than reading them manually,
    // but reading the debug property is essential for the custom Properties object.
    @Value("${spring.mail.properties.mail.debug:false}")
    private String mailDebug;

    // Use explicit configuration settings for port 465 (SMTPS)
    @Value("${spring.mail.properties.mail.smtp.auth:false}")
    private String smtpAuth;

    @Value("${spring.mail.properties.mail.smtp.ssl.enable:false}")
    private String smtpSSLEnable;

    @Value("${spring.mail.properties.mail.smtp.socketFactory.class:}")
    private String socketFactoryClass;


    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(this.host);
        mailSender.setPort(this.port);
        mailSender.setUsername(this.username);
        mailSender.setPassword(this.password);
        mailSender.setProtocol(this.protocol); // Set protocol explicitly

        Properties props = mailSender.getJavaMailProperties();
        
        // Setting mail properties explicitly
        props.put("mail.smtp.auth", this.smtpAuth);
        props.put("mail.smtp.ssl.enable", this.smtpSSLEnable);
        props.put("mail.smtp.socketFactory.class", this.socketFactoryClass);
        
        // This is the CRITICAL DEBUGGING LINE
        props.put("mail.debug", this.mailDebug); 
        
        // Adding timeouts directly to the properties object
        // NOTE: These values must exist in application-local.properties
        // If not present, they will default to 0 (no timeout)
        props.put("mail.smtp.connectiontimeout", "60000"); 
        props.put("mail.smtp.timeout", "60000");
        props.put("mail.smtp.writetimeout", "60000");

        mailSender.setJavaMailProperties(props);
        return mailSender;
    }
}
