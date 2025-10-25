package com.studyGroup.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ChatMessage")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int _id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "_groupId", nullable = false)
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "_senderId", nullable = false)
    private User sender;

    @Lob // Use @Lob for TEXT type, good for long messages
    @Column(name = "_content", nullable = false)
    private String content;

    @Column(name = "_timestamp", nullable = false, updatable = false)
    private Instant timestamp;

    // This method sets the timestamp before the entity is saved
    @PrePersist
    protected void onCreate() {
        timestamp = Instant.now();
    }

    // --- Constructors ---
    public ChatMessage() {
    }

    // --- Getters and Setters ---
    // (Add your standard getters and setters for all fields)
    
    public int get_id() {
        return _id;
    }

    public void set_id(int _id) {
        this._id = _id;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    public User getSender() {
        return sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}