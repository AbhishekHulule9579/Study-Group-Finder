package com.studyGroup.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.studyGroup.backend.dto.GeminiDTO;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    public String getChatResponse(String prompt) {

        String url = apiUrl + "?key=" + apiKey;
        GeminiDTO.Request request = new GeminiDTO.Request(prompt);
        
        GeminiDTO.Response response = restTemplate.postForObject(url, request, GeminiDTO.Response.class);
        
        try{
        if (response != null && response.candidates != null && !response.candidates.isEmpty()) {
            return response.candidates.get(0).content.parts.get(0).text;
        }
    
        return "I couldn't understand that.";
    }catch(Exception e){
        System.out.println("Error calling Gemini API "+e.getMessage());
        return "Sorry, I'm having trouble connecting to my brain right now. Please try later";
    }
    }
}
