package com.email.writer.controller;

import com.email.writer.dto.SaveReplyRequest;
import com.email.writer.entity.SavedReply;
import com.email.writer.entity.User;
import com.email.writer.service.AuthService;
import com.email.writer.service.SavedReplyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Enhanced controller for saved replies with advanced search and filtering capabilities.
 * 
 * Design Pattern: RESTful API with clear separation of concerns
 * - Controller handles HTTP layer (validation, response formatting)
 * - Service layer handles business logic
 * - Repository layer handles data persistence
 * 
 * Security: All endpoints are JWT-protected via Spring Security filter chain
 */
@RestController
@RequestMapping("/api/replies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class SavedReplyController {

    private final SavedReplyService savedReplyService;
    private final AuthService authService;

    /**
     * Save a generated reply to the database for future reference.
     *
     * Request Body (JSON):
     * {
     *   "emailSubject": "string (required, subject of the email)",
     *   "emailContent": "string (required, original email content)",
     *   "tone": "string (optional, e.g. 'professional', 'casual')",
     *   "replyText": "string (required, the generated reply text)",
     *   "summary": "string (optional, summary of the reply)"
     * }
     *
     * Field requirements:
     * - emailSubject: Required, subject of the email.
     * - emailContent: Required, original email content.
     * - tone: Optional, e.g. 'professional', 'casual'.
     * - replyText: Required, the generated reply text.
     * - summary: Optional, summary of the reply.
     *
     * @param request SaveReplyRequest JSON body
     * @param authentication JWT authentication context from Spring Security
     * @return 200 OK with saved reply ID and timestamp on success, 400 Bad Request with error details on failure
     */
    @PostMapping("/save")
    public ResponseEntity<?> saveReply(@Valid @RequestBody SaveReplyRequest request, Authentication authentication) {
        try {
            User currentUser = authService.getCurrentUser(authentication);
            SavedReply saved = savedReplyService.saveReply(request, currentUser);
            log.info("Reply saved for user {} with ID {}", currentUser.getUsername(), saved.getId());
            return ResponseEntity.ok(Map.of(
                "message", "Reply saved successfully", 
                "id", saved.getId(), 
                "createdAt", saved.getCreatedAt()
            ));
        } catch (Exception ex) {
            log.error("Save reply failed for user: {}", 
                authentication != null ? authentication.getName() : "unknown", ex);
            // Error: Failed to save reply (could be DB error, validation, etc.)
            return ResponseEntity.badRequest().body(Map.of(
                "error", "save_failed",
                "message", "Failed to save reply.",
                "reason", ex.getMessage()
            ));
        }
    }

    /**
     * Retrieve user's saved replies with pagination and optional filtering.
     *
     * Query Parameters:
     * - page (integer, optional, default: 0): Page number (0-based).
     * - size (integer, optional, default: 20): Page size.
     * - tone (string, optional): Filter by tone.
     * - fromDate (ISO date-time string, optional): Filter for replies created after this date.
     * - toDate (ISO date-time string, optional): Filter for replies created before this date.
     *
     * @param authentication JWT authentication context
     * @param page Page number (0-based, default: 0)
     * @param size Page size (default: 20)
     * @param tone Optional filter by tone (professional, casual, etc.)
     * @param fromDate Optional filter for replies created after this date
     * @param toDate Optional filter for replies created before this date
     * @return 200 OK with paginated or filtered replies, 400 Bad Request with error details on failure
     */
    @GetMapping("/history")
    public ResponseEntity<?> getUserReplies(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String tone,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) {
        try {
            User user = authService.getCurrentUser(authentication);
            if (tone != null || fromDate != null || toDate != null) {
                List<SavedReply> filtered = savedReplyService.getUserRepliesFiltered(
                    user.getId(), tone, fromDate, toDate);
                return ResponseEntity.ok(Map.of(
                    "content", filtered,
                    "total", filtered.size(),
                    "filtered", true
                ));
            }
            if (page >= 0 && size > 0) {
                Page<SavedReply> p = savedReplyService.getUserReplies(user.getId(), page, size);
                return ResponseEntity.ok(Map.of(
                    "content", p.getContent(),
                    "totalPages", p.getTotalPages(),
                    "totalElements", p.getTotalElements(),
                    "currentPage", page,
                    "size", size
                ));
            } else {
                List<SavedReply> list = savedReplyService.getUserReplies(user.getId());
                return ResponseEntity.ok(Map.of("content", list, "total", list.size()));
            }
        } catch (Exception ex) {
            log.error("Fetch history failed for user: {}", authentication.getName(), ex);
            // Error: Failed to fetch history (DB error, user not found, etc.)
            return ResponseEntity.badRequest().body(Map.of(
                "error", "fetch_history_failed",
                "message", "Failed to fetch reply history.",
                "reason", ex.getMessage()
            ));
        }
    }

    /**
     * Search user's saved replies by query and optional tone.
     *
     * Query Parameters:
     * - q (string, required): Search query (searches subject, content, reply text).
     * - tone (string, optional): Filter by tone.
     *
     * @param q Search query (required)
     * @param tone Optional filter by tone
     * @param authentication JWT authentication context
     * @return 200 OK with search results, 400 Bad Request with error details on failure
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchReplies(@RequestParam(value = "q", required = false) String q,
                                           @RequestParam(value = "tone", required = false) String tone,
                                           Authentication authentication) {
        try {
            if (q == null || q.trim().isEmpty()) {
                // Error: Missing required search parameter
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "missing_query_param",
                    "message", "Query parameter 'q' is required and cannot be null or empty."
                ));
            }
            User currentUser = authService.getCurrentUser(authentication);
            List<SavedReply> replies = savedReplyService.searchUserReplies(
                currentUser.getId(), q, tone);
            log.debug("Search completed for user {} with query '{}', found {} results",
                currentUser.getUsername(), q, replies.size());
            java.util.Map<String, Object> response = new java.util.LinkedHashMap<>();
            response.put("results", replies);
            response.put("query", q);
            response.put("tone", tone);
            response.put("total", replies.size());
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Search failed for query '{}': {}", q, ex.getMessage());
            // Error: Search failed (DB error, etc.)
            return ResponseEntity.badRequest().body(Map.of(
                "error", "search_failed",
                "message", "Failed to search replies.",
                "reason", ex.getMessage()
            ));
        }
    }

    /**
     * Get user's favorite replies (bookmarked for quick access).
     *
     * No input required. Returns all favorite replies for the authenticated user.
     *
     * @param authentication JWT authentication context
     * @return 200 OK with favorite replies, 400 Bad Request with error details on failure
     */
    @GetMapping("/favorites")
    public ResponseEntity<?> getFavoriteReplies(Authentication authentication) {
        try {
            User user = authService.getCurrentUser(authentication);
            List<SavedReply> favorites = savedReplyService.getFavoriteReplies(user.getId());
            return ResponseEntity.ok(Map.of(
                "favorites", favorites, 
                "total", favorites.size()
            ));
        } catch (Exception ex) {
            log.error("Fetch favorites failed for user: {}", authentication.getName(), ex);
            // Error: Failed to fetch favorites (DB error, user not found, etc.)
            return ResponseEntity.badRequest().body(Map.of(
                "error", "fetch_favorites_failed",
                "message", "Failed to fetch favorite replies.",
                "reason", ex.getMessage()
            ));
        }
    }

    /**
     * Toggle favorite status of a saved reply.
     *
     * Path Variable:
     * - id (long, required): ID of the reply to toggle favorite status.
     *
     * @param id ID of the reply
     * @param authentication JWT authentication context
     * @return 200 OK with new favorite status, 400 Bad Request with error details on failure
     */
    @PutMapping("/{id}/favorite")
    public ResponseEntity<?> toggleFavorite(@PathVariable Long id, Authentication authentication) {
        try {
            User user = authService.getCurrentUser(authentication);
            SavedReply reply = savedReplyService.toggleFavorite(id, user.getId());
            String action = reply.getIsFavorite() ? "Added to favorites" : "Removed from favorites";
            log.info("Favorite toggled for reply {} by user {}: {}", 
                id, user.getUsername(), action);
            return ResponseEntity.ok(Map.of(
                "message", action, 
                "isFavorite", reply.getIsFavorite()
            ));
        } catch (Exception ex) {
            log.error("Toggle favorite failed for reply {}: {}", id, ex.getMessage());
            // Error: Failed to toggle favorite (reply not found, DB error, etc.)
            return ResponseEntity.badRequest().body(Map.of(
                "error", "toggle_favorite_failed",
                "message", "Failed to toggle favorite status.",
                "reason", ex.getMessage()
            ));
        }
    }

    /**
     * Soft delete a saved reply (marks as deleted rather than physical deletion).
     *
     * Path Variable:
     * - id (long, required): ID of the reply to delete.
     *
     * @param id ID of the reply
     * @param authentication JWT authentication context
     * @return 200 OK on success, 400 Bad Request with error details on failure
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReply(@PathVariable Long id, Authentication authentication) {
        try {
            User user = authService.getCurrentUser(authentication);
            savedReplyService.deleteReply(id, user.getId());
            log.info("Reply {} deleted by user {}", id, user.getUsername());
            return ResponseEntity.ok(Map.of("message", "Reply deleted successfully"));
        } catch (Exception ex) {
            log.error("Delete failed for reply {}: {}", id, ex.getMessage());
            // Error: Failed to delete reply (reply not found, DB error, etc.)
            return ResponseEntity.badRequest().body(Map.of(
                "error", "delete_failed",
                "message", "Failed to delete reply.",
                "reason", ex.getMessage()
            ));
        }
    }

    /**
     * Get comprehensive statistics for the user's saved replies.
     *
     * No input required. Returns statistics for the authenticated user.
     *
     * @param authentication JWT authentication context
     * @return 200 OK with statistics, 400 Bad Request with error details on failure
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats(Authentication authentication) {
        try {
            User user = authService.getCurrentUser(authentication);
            Map<String, Object> stats = savedReplyService.getUserStatistics(user.getId());
            stats.put("username", user.getUsername());
            return ResponseEntity.ok(stats);
        } catch (Exception ex) {
            log.error("Stats fetch failed for user: {}", authentication.getName(), ex);
            // Error: Failed to fetch statistics (DB error, user not found, etc.)
            return ResponseEntity.badRequest().body(Map.of(
                "error", "fetch_stats_failed",
                "message", "Failed to fetch statistics.",
                "reason", ex.getMessage()
            ));
        }
    }

    /**
     * Export user's saved replies to CSV format.
     *
     * No input required. Returns a CSV file of all saved replies for the authenticated user.
     *
     * @param authentication JWT authentication context
     * @return 200 OK with CSV file, 400 Bad Request with error details on failure
     */
    @GetMapping("/export")
    public ResponseEntity<?> exportReplies(Authentication authentication) {
        try {
            User user = authService.getCurrentUser(authentication);
            String csvData = savedReplyService.exportUserRepliesToCsv(user.getId());
            return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=saved_replies_" + user.getUsername() + ".csv")
                .body(csvData);
        } catch (Exception ex) {
            log.error("Export failed for user: {}", authentication.getName(), ex);
            // Error: Failed to export replies (DB error, etc.)
            return ResponseEntity.badRequest()
                .header("Content-Type", "application/json")
                .body(Map.of(
                    "error", "export_failed",
                    "message", "Failed to export replies.",
                    "reason", ex.getMessage()
                ));
        }
    }
}
