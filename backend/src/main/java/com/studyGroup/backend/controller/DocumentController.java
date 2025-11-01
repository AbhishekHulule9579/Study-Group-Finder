package com.studyGroup.backend.controller;

import com.studyGroup.backend.model.GroupMessage;
import com.studyGroup.backend.model.MessageDocument;
import com.studyGroup.backend.service.DocumentService;
import com.studyGroup.backend.service.GroupMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "http://localhost:5173")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private GroupMessageService groupMessageService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file,
                                        @RequestParam("groupId") Long groupId,
                                        @RequestParam("senderId") Integer senderId) {
        try {
            GroupMessage message = groupMessageService.saveDocumentMessage(groupId, senderId, file);
            documentService.storeFile(file, message);
            return ResponseEntity.ok("File uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Could not upload the file: " + file.getOriginalFilename() + "!");
        }
    }

    @GetMapping("/{messageId}")
    public ResponseEntity<Resource> getDocument(@PathVariable Long messageId) {
        // This is a simplified example. In a real app, you'd want to
        // verify that the user has permission to access this document.
        MessageDocument doc = documentService.getDocumentByMessageId(messageId);
        Resource resource = documentService.loadFileAsResource(doc.getStoredFilename());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getOriginalFilename() + "\"")
                .body(resource);
    }
}
