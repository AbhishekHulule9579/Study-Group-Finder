package com.studyGroup.backend.service;

import com.studyGroup.backend.model.MessageDocument;
import com.studyGroup.backend.model.GroupMessage;
import com.studyGroup.backend.repository.MessageDocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Autowired
    private MessageDocumentRepository documentRepository;

    private Path getUploadPath() {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            try {
                Files.createDirectories(uploadPath);
            } catch (IOException e) {
                throw new RuntimeException("Could not create upload directory!", e);
            }
        }
        return uploadPath;
    }

    public MessageDocument storeFile(MultipartFile file, GroupMessage message) {
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String storedFilename = UUID.randomUUID().toString() + "_" + originalFilename;
        
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file " + originalFilename);
            }
            
            Path targetLocation = getUploadPath().resolve(storedFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            MessageDocument document = new MessageDocument(
                originalFilename,
                storedFilename,
                file.getContentType(),
                file.getSize(),
                targetLocation.toString()
            );
            
            document.setMessage(message);
            return documentRepository.save(document);
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + originalFilename, e);
        }
    }

    public Resource loadFileAsResource(String filename) {
        try {
            Path filePath = getUploadPath().resolve(filename);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found " + filename);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("File not found " + filename, e);
        }
    }

    public MessageDocument getDocument(Long documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + documentId));
    }

    public MessageDocument getDocumentByMessageId(Long messageId) {
        MessageDocument doc = documentRepository.findByMessage_Id(messageId);
        if (doc == null) {
            throw new RuntimeException("Document not found for message id: " + messageId);
        }
        return doc;
    }

    public void deleteDocument(MessageDocument document) {
        try {
            Path filePath = Paths.get(document.getFilePath());
            Files.deleteIfExists(filePath);
            documentRepository.delete(document);
        } catch (IOException e) {
            throw new RuntimeException("Could not delete file", e);
        }
    }

    public List<MessageDocument> getDocumentsByGroupId(Long groupId) {
        return documentRepository.findByMessage_Group_GroupIdOrderByUploadTimeDesc(groupId);
    }
}
