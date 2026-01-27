package com.studyGroup.backend.dto;

import java.util.List;

public class GeminiDTO {
 public static class Request {
        public List<Content> contents;
        
        public Request(String text) {
            this.contents = List.of(new Content(new Part(text)));
        }
    }
    public static class Content {
        public List<Part> parts;
        public Content(Part part) { this.parts = List.of(part); }
    }
    public static class Part {
        public String text;
        public Part(String text) { this.text = text; }
    }
    public static class Response {
        public List<Candidate> candidates;
    }
    public static class Candidate {
        public Content content;
    }
}