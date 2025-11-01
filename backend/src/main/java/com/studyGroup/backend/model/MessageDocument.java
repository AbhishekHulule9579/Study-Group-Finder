package com.studyGroup.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "message_documents")
@Data
@NoArgsConstructor
public class MessageDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "original_filename")
    private String originalFilename;

    @Column(name = "stored_filename")
    private String storedFilename;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "upload_time")
    private LocalDateTime uploadTime = LocalDateTime.now();

    @OneToOne
    @JoinColumn(name = "message_id")
    private GroupMessage message;

    @Column(name = "file_path")
    private String filePath;

    public MessageDocument(String originalFilename, String storedFilename, String fileType, Long fileSize, String filePath) {
        this.originalFilename = originalFilename;
        this.storedFilename = storedFilename;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.filePath = filePath;
    }
}