package com.email.writer.dto;

import lombok.Data;

/**
 * DTO representing an incoming request to generate an email reply.
 * Added `language` to support multi-language generation (e.g., "en", "hi", "es").
 */
@Data
public class EmailRequest {
    private String subject;
    private String emailContent;
    private String tone;
    private String language; // optional; default "en" at service layer if null
}
