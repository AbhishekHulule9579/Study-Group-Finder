package com.studyGroup.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "group_messages")
@Getter
@Setter
@NoArgsConstructor
public class GroupMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Foreign Key to the existing 'Group' entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    // Foreign Key to the existing 'User' entity (the sender)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_user_id", nullable = false)
    private User sender;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "message_type", length = 10, nullable = false)
    private String messageType = "TEXT"; // Default to 'TEXT'

    @Column(name = "poll_id")
    private Long pollId;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    // Optional: Add a constructor for easy message creation
    public GroupMessage(Group group, User sender, String content) {
        this.group = group;
        this.sender = sender;
        this.content = content;
        // timestamp and messageType use defaults
    }
}