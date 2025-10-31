package com.studyGroup.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "message_replies")
@Getter
@Setter
@NoArgsConstructor
public class MessageReply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The message that is the reply
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_message_id", nullable = false, unique = true)
    private GroupMessage replyMessage;

    // The original message that was replied to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_message_id", nullable = false)
    private GroupMessage originalMessage;

    // The user who replied (duplicate of replyMessage.sender but kept for convenience)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "replier_user_id", nullable = false)
    private User replier;
}
