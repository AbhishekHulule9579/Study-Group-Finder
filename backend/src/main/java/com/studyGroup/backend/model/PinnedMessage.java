package com.studyGroup.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "pinned_messages")
@Data
@NoArgsConstructor
public class PinnedMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_id", nullable = false)
    private Long groupId;

    @Column(name = "message_id", nullable = false)
    private Long messageId;

    @Column(name = "pinned_by", nullable = false)
    private Integer pinnedBy;

    @Column(name = "pinned_at", nullable = false)
    private LocalDateTime pinnedAt;

    public PinnedMessage(Long groupId, Long messageId, Integer pinnedBy) {
        this.groupId = groupId;
        this.messageId = messageId;
        this.pinnedBy = pinnedBy;
        this.pinnedAt = LocalDateTime.now();
    }
}