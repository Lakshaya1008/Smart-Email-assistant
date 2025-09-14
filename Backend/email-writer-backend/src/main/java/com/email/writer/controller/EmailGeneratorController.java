package com.email.writer.controller;

import com.email.writer.dto.EmailRequest;
import com.email.writer.service.AuthService;
import com.email.writer.service.EmailGeneratorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for endpoints related to AI email generation.
 * Protected endpoints require JWT; AuthService is used to fetch current user and assert authentication.
 */
@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class EmailGeneratorController {

    private final EmailGeneratorService emailGeneratorService;
    private final AuthService authService;

    /**
     * Generate 3 reply variations + summary.
     *
     * Request Body (JSON):
     * {
     *   "subject": "string (required, subject of the email)",
     *   "emailContent": "string (required, original email content)",
     *   "tone": "string (optional, e.g. 'professional', 'casual')",
     *   "language": "string (optional, e.g. 'en', 'fr')"
     * }
     *
     * Field requirements:
     * - subject: Required, subject of the email.
     * - emailContent: Required, original email content.
     * - tone: Optional, e.g. 'professional', 'casual'.
     * - language: Optional, e.g. 'en', 'fr'.
     *
     * @param request EmailRequest JSON body
     * @param authentication JWT authentication context
     * @return 200 OK with generated replies and summary, 500 Internal Server Error with error details on failure
     */
    @PostMapping("/generate")
    public ResponseEntity<?> generateEmail(@Valid @RequestBody EmailRequest request, Authentication authentication) {
        try {
            authService.getCurrentUser(authentication); // will throw if not authenticated
            log.info("Email generate requested (subject={})", request.getSubject());

            Map<String, Object> result = emailGeneratorService.generateMultipleEmailReplies(request, false);

            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            log.error("Error generating email replies", ex);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to generate email replies", "details", ex.getMessage()));
        }
    }

    /**
     * Regenerate - produce new variations; will modify prompt slightly for diversity.
     *
     * Request Body (JSON):
     * {
     *   "subject": "string (required, subject of the email)",
     *   "emailContent": "string (required, original email content)",
     *   "tone": "string (optional, e.g. 'professional', 'casual')",
     *   "language": "string (optional, e.g. 'en', 'fr')"
     * }
     *
     * Field requirements:
     * - subject: Required, subject of the email.
     * - emailContent: Required, original email content.
     * - tone: Optional, e.g. 'professional', 'casual'.
     * - language: Optional, e.g. 'en', 'fr'.
     *
     * @param request EmailRequest JSON body
     * @param authentication JWT authentication context
     * @return 200 OK with regenerated replies and summary, 500 Internal Server Error with error details on failure
     */
    @PostMapping("/regenerate")
    public ResponseEntity<?> regenerateEmail(@Valid @RequestBody EmailRequest request, Authentication authentication) {
        try {
            authService.getCurrentUser(authentication);
            log.info("Email regenerate requested (subject={})", request.getSubject());

            Map<String, Object> result = emailGeneratorService.generateMultipleEmailReplies(request, true);

            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            log.error("Error regenerating email replies", ex);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to regenerate email replies", "details", ex.getMessage()));
        }
    }

    /**
     * Backwards-compatible single generate (keeps original behavior).
     *
     * Request Body (JSON):
     * {
     *   "subject": "string (required, subject of the email)",
     *   "emailContent": "string (required, original email content)",
     *   "tone": "string (optional, e.g. 'professional', 'casual')",
     *   "language": "string (optional, e.g. 'en', 'fr')"
     * }
     *
     * Field requirements:
     * - subject: Required, subject of the email.
     * - emailContent: Required, original email content.
     * - tone: Optional, e.g. 'professional', 'casual'.
     * - language: Optional, e.g. 'en', 'fr'.
     *
     * @param request EmailRequest JSON body
     * @param authentication JWT authentication context
     * @return 200 OK with single generated reply, 500 Internal Server Error with error details on failure
     */
    @PostMapping("/generate-single")
    public ResponseEntity<?> generateSingle(@Valid @RequestBody EmailRequest request, Authentication authentication) {
        try {
            authService.getCurrentUser(authentication);
            log.info("Single email generate requested (subject={})", request.getSubject());

            Map<String, String> response = emailGeneratorService.generateEmailReply(request);
            
            // Return both summary and reply in the response
            return ResponseEntity.ok(Map.of(
                "summary", response.getOrDefault("summary", ""),
                "reply", response.getOrDefault("reply", "")
            ));
        } catch (Exception ex) {
            log.error("Error generating single email reply", ex);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to generate email", 
                "details", ex.getMessage()
            ));
        }
    }

    /**
     * Simple test endpoint to verify Gemini connectivity (no auth required).
     *
     * No input required. Returns a sample generated reply.
     *
     * @return 200 OK with sample reply, 500 Internal Server Error with error details on failure
     */
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        try {
            EmailRequest test = new EmailRequest();
            test.setSubject("Test");
            test.setEmailContent("Testing connectivity");
            test.setTone("professional");
            test.setLanguage("en");
            Map<String, String> response = emailGeneratorService.generateEmailReply(test);
            return ResponseEntity.ok(Map.of(
                "status", "ok",
                "summary", response.getOrDefault("summary", ""),
                "reply", response.getOrDefault("reply", "")
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("status", "error", "message", ex.getMessage()));
        }
    }
}
