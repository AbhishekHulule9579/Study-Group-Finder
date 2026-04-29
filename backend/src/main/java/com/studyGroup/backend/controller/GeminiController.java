package com.studyGroup.backend.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.studyGroup.backend.service.GeminiService;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins="http://localhost:5173") // we are allowing the frontend access here 
public class GeminiController {
    
    @Autowired
    private GeminiService geminiService;


    @PostMapping("/chat")
    public Map<String,String>chat(@RequestBody Map<String,String>payload){
        String userMessage=payload.get("message");
        String aiResponse=geminiService.getChatResponse(userMessage);
        return Map.of("response",aiResponse);
    }
}
