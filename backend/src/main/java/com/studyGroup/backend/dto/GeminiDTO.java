package com.studyGroup.backend.dto;

import java.util.List;

public class GeminiDTO {

    //the google api expects this type of the request structure 
 public static class Request {
        public List<Content> contents;
        
        public Request() {}
        
        public Request(String text) {
            this.contents = List.of(new Content(new Part(text)));
        }
    }
    
//we can create the request object like this
    // GeminiDTO.Request myRequest = new GeminiDTO.Request("What is the capital of France?");
/*
{
  "contents": [
    {
      "parts": [
        {
          "text": "What is the capital of France?"
        }
      ]
    }
  ]
}
*/

    public static class Content {
        public List<Part> parts;
        public Content() {}
        public Content(Part part) { this.parts = List.of(part); }
    }
    public static class Part {
        public String text;
        public Part() {}
        public Part(String text) { this.text = text; }
    }

    
    //the google api returns response in this format
    public static class Response {
        public List<Candidate> candidates;
        public Response() {}
    }

    
    public static class Candidate {
        public Content content;
        public Candidate() {}
    }
}
/*
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "The capital of France is Paris."
          }
        ]
      }
    }
  ]
}
*/