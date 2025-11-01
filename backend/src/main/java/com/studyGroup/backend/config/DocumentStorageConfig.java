package com.studyGroup.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class DocumentStorageConfig {

    @Value("${file.upload-dir}")
    private String documentStorageLocation;

    private Path documentStoragePath;

    @PostConstruct
    public void init() {
        try {
            documentStoragePath = Paths.get(documentStorageLocation).toAbsolutePath().normalize();
            Files.createDirectories(documentStoragePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create document storage directory", e);
        }
    }

    public Path getDocumentStoragePath() {
        return documentStoragePath;
    }

    public String generateUniqueFileName(String originalFileName) {
        String fileName = StringUtils.cleanPath(originalFileName);
        return System.currentTimeMillis() + "_" + fileName;
    }
}