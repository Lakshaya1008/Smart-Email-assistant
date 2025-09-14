package com.email.writer.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * SavedReply - stores generated replies a user chooses to save.
 * Includes summary, replyText, tone, subject and original email content.
 */
@Entity
@Table(name = "saved_replies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SavedReply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Owner user relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "email_subject", length = 500)
    private String emailSubject;

    @Column(name = "email_content", columnDefinition = "TEXT")
    private String emailContent;

    @Column(name = "tone")
    private String tone;

    @Column(name = "reply_text", columnDefinition = "TEXT")
    private String replyText;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_favorite")
    private Boolean isFavorite = false;

    public SavedReply(User user, String emailSubject, String emailContent, String tone, String replyText, String summary) {
        this.user = user;
        this.emailSubject = emailSubject;
        this.emailContent = emailContent;
        this.tone = tone;
        this.replyText = replyText;
        this.summary = summary;
    }
}
