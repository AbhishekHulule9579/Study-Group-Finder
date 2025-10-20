package com.studyGroup.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;


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

    @Value("${spring.mail.properties.mail.debug:false}")
    private String mailDebug;

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
        mailSender.setProtocol(this.protocol); 

        Properties props = mailSender.getJavaMailProperties();
        
        props.put("mail.smtp.auth", this.smtpAuth);
        props.put("mail.smtp.ssl.enable", this.smtpSSLEnable);
        props.put("mail.smtp.socketFactory.class", this.socketFactoryClass);
        
        props.put("mail.debug", this.mailDebug); 
        
        props.put("mail.smtp.connectiontimeout", "60000"); 
        props.put("mail.smtp.timeout", "60000");
        props.put("mail.smtp.writetimeout", "60000");

        mailSender.setJavaMailProperties(props);
        return mailSender;
    }
}
