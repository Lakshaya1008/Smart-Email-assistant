package com.email.writer.dto;

import lombok.Data;

/**
 * DTO used to save a generated reply to DB.
 */
@Data
public class SaveReplyRequest {
    private String emailSubject;
    private String emailContent;
    private String tone;
    private String replyText;
    private String summary;
}
