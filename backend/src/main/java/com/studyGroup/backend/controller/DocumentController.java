package com.studyGroup.backend.controller;

import com.studyGroup.backend.model.GroupMessage;
import com.studyGroup.backend.model.MessageDocument;
import com.studyGroup.backend.model.User;
import com.studyGroup.backend.service.DocumentService;
import com.studyGroup.backend.service.GroupMessageService;
import com.studyGroup.backend.service.GroupService;
import com.studyGroup.backend.service.JWTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "http://localhost:5173")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private GroupMessageService groupMessageService;

    @Autowired
    private GroupService groupService;

    @Autowired
    private JWTService jwtService;

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
    public ResponseEntity<Resource> getDocument(@PathVariable Long messageId, @RequestHeader("Authorization") String authHeader) {
        // Verify user is authorized to access this document (must be group member)
        String token = authHeader.replace("Bearer ", "");
        Integer userId = jwtService.extractUserId(token);
        User currentUser = new User();
        currentUser.setId(userId);

        MessageDocument doc = documentService.getDocumentByMessageId(messageId);
        Long groupId = doc.getMessage().getGroup().getGroupId();

        // Check if user is member of the group
        String userRole = groupService.getUserRoleInGroup(groupId, currentUser);
        if ("non-member".equals(userRole)) {
            return ResponseEntity.status(403).body(null);
        }

        Resource resource = documentService.loadFileAsResource(doc.getStoredFilename());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getOriginalFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getGroupDocuments(@PathVariable Long groupId, @RequestHeader("Authorization") String authHeader) {
        try {
            // Verify user is member of the group
            String token = authHeader.replace("Bearer ", "");
            Integer userId = jwtService.extractUserId(token);
            User currentUser = new User();
            currentUser.setId(userId);

            String userRole = groupService.getUserRoleInGroup(groupId, currentUser);
            if ("non-member".equals(userRole)) {
                return ResponseEntity.status(403).body("Access denied: You are not a member of this group");
            }

            // Fetch all documents for the group
            List<MessageDocument> documents = documentService.getDocumentsByGroupId(groupId);

            // Convert to DTO with required fields
            List<Map<String, Object>> documentDTOs = documents.stream()
                .map(doc -> {
                    Map<String, Object> dto = new java.util.HashMap<>();
                    dto.put("id", doc.getId());
                    dto.put("originalFilename", doc.getOriginalFilename());
                    dto.put("fileSize", doc.getFileSize());
                    dto.put("uploadTime", doc.getUploadTime());
                    dto.put("senderName", doc.getMessage().getSender().getName());
                    return dto;
                })
                .collect(Collectors.toList());

            return ResponseEntity.ok(documentDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching documents: " + e.getMessage());
        }
    }
}
