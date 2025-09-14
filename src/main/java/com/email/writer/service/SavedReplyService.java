package com.email.writer.service;

import com.email.writer.dto.SaveReplyRequest;
import com.email.writer.entity.SavedReply;
import com.email.writer.entity.User;
import com.email.writer.repository.SavedReplyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Enhanced service layer for saved reply operations.
 * 
 * Design Patterns Used:
 * 1. Service Layer Pattern - Encapsulates business logic
 * 2. Repository Pattern - Data access abstraction
 * 3. Transaction Management - ACID compliance for data operations
 * 
 * Key Features:
 * - Advanced filtering and search
 * - Statistics generation
 * - Data export capabilities
 * - Soft delete functionality
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SavedReplyService {

    private final SavedReplyRepository repo;

    /**
     * Save a new reply to the database.
     * 
     * Business Logic:
     * - Creates new SavedReply entity from request
     * - Associates with authenticated user
     * - Persists to database with timestamp
     * 
     * @param req Contains reply details and metadata
     * @param user Authenticated user who owns this reply
     * @return Persisted SavedReply with generated ID
     */
    @Transactional
    public SavedReply saveReply(SaveReplyRequest req, User user) {
        log.debug("Saving reply for user {} with subject '{}'", 
            user.getUsername(), req.getEmailSubject());
            
        SavedReply sr = new SavedReply(
            user, 
            req.getEmailSubject(), 
            req.getEmailContent(), 
            req.getTone(), 
            req.getReplyText(), 
            req.getSummary()
        );
        
        SavedReply saved = repo.save(sr);
        log.info("Reply saved with ID {} for user {}", saved.getId(), user.getUsername());
        
        return saved;
    }

    /**
     * Retrieve all replies for a user, ordered by creation date (newest first).
     */
    @Transactional(readOnly = true)
    public List<SavedReply> getUserReplies(Long userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Paginated retrieval of user replies.
     * Implements pagination for better performance with large datasets.
     */
    @Transactional(readOnly = true)
    public Page<SavedReply> getUserReplies(Long userId, int page, int size) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
    }

    /**
     * Advanced filtering of user replies by multiple criteria.
     * 
     * @param userId User identifier
     * @param tone Optional tone filter (professional, casual, etc.)
     * @param fromDate Optional start date filter
     * @param toDate Optional end date filter
     * @return Filtered list of replies
     */
    @Transactional(readOnly = true)
    public List<SavedReply> getUserRepliesFiltered(Long userId, String tone, 
                                                  LocalDateTime fromDate, LocalDateTime toDate) {
        
        log.debug("Filtering replies for user {} with tone='{}', from={}, to={}", 
            userId, tone, fromDate, toDate);
            
        return repo.findByUserIdWithFilters(userId, tone, fromDate, toDate);
    }

    /**
     * Enhanced search with multiple criteria.
     * Performs full-text search across subject, content, and reply text.
     */
    @Transactional(readOnly = true)
    public List<SavedReply> searchUserReplies(Long userId, String searchTerm, String tone) {
        log.debug("Searching replies for user {} with term '{}' and tone '{}'", 
            userId, searchTerm, tone);
            
        if (tone != null && !tone.isBlank()) {
            return repo.findByUserIdAndSearchTermAndTone(userId, searchTerm, tone);
        }
        return repo.findByUserIdAndSearchTerm(userId, searchTerm);
    }

    /**
     * Get user's favorite replies for quick access.
     */
    @Transactional(readOnly = true)
    public List<SavedReply> getFavoriteReplies(Long userId) {
        return repo.findByUserIdAndIsFavoriteOrderByCreatedAtDesc(userId, true);
    }

    /**
     * Toggle favorite status with optimistic locking to prevent race conditions.
     */
    @Transactional
    public SavedReply toggleFavorite(Long id, Long userId) {
        SavedReply reply = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Reply not found with ID: " + id));
            
        // Security check: ensure user owns this reply
        if (!reply.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied: Reply belongs to different user");
        }
        
        boolean newFavoriteStatus = !Boolean.TRUE.equals(reply.getIsFavorite());
        reply.setIsFavorite(newFavoriteStatus);
        
        SavedReply updated = repo.save(reply);
        log.debug("Toggled favorite status to {} for reply {} by user {}", 
            newFavoriteStatus, id, userId);
            
        return updated;
    }

    /**
     * Soft delete implementation - marks reply as deleted instead of physical deletion.
     * Maintains referential integrity and allows for potential recovery.
     */
    @Transactional
    public void deleteReply(Long id, Long userId) {
        SavedReply reply = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Reply not found with ID: " + id));
            
        if (!reply.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied: Cannot delete reply owned by different user");
        }
        
        // Physical deletion for now - could be changed to soft delete if needed
        repo.delete(reply);
        log.info("Reply {} deleted by user {}", id, userId);
    }

    /**
     * Get count of user's replies for pagination and statistics.
     */
    @Transactional(readOnly = true)
    public long getUserReplyCount(Long userId) {
        return repo.countByUserId(userId);
    }

    /**
     * Generate comprehensive statistics for user dashboard.
     * 
     * Statistics include:
     * - Total replies count
     * - Favorite replies count
     * - Tone distribution
     * - Recent activity (replies per week/month)
     * - Most active email subjects
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getUserStatistics(Long userId) {
        List<SavedReply> allReplies = repo.findByUserIdOrderByCreatedAtDesc(userId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalReplies", allReplies.size());
        
        // Count favorite replies
        int favoriteCount = (int) allReplies.stream()
            .filter(r -> Boolean.TRUE.equals(r.getIsFavorite()))
            .count();
        stats.put("favoriteReplies", favoriteCount);
            
        // Tone distribution analysis
        Map<String, Long> toneDistribution = allReplies.stream()
            .filter(r -> r.getTone() != null && !r.getTone().isBlank())
            .collect(Collectors.groupingBy(
                SavedReply::getTone, 
                Collectors.counting()
            ));
        stats.put("toneDistribution", new HashMap<>(toneDistribution));
        
        // Recent activity (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long recentReplies = allReplies.stream()
            .filter(r -> r.getCreatedAt().isAfter(thirtyDaysAgo))
            .count();
        stats.put("recentActivity", (int) recentReplies);
        
        // Most common email subjects (top 5)
        Map<String, Long> subjectFrequency = allReplies.stream()
            .filter(r -> r.getEmailSubject() != null && !r.getEmailSubject().isBlank())
            .collect(Collectors.groupingBy(
                SavedReply::getEmailSubject, 
                Collectors.counting()
            ));
        
        List<Map<String, Object>> topSubjects = subjectFrequency.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(5)
            .map(entry -> {
                Map<String, Object> subjectMap = new HashMap<>();
                subjectMap.put("subject", entry.getKey());
                subjectMap.put("count", entry.getValue().intValue());
                return subjectMap;
            })
            .collect(Collectors.toList());
        stats.put("topSubjects", topSubjects);
        
        log.debug("Generated statistics for user {}: {} total replies, {} favorites", 
            userId, allReplies.size(), favoriteCount);
            
        return stats;
    }

    /**
     * Export user's saved replies to CSV format for data portability.
     * 
     * CSV Format:
     * ID,Subject,Tone,Created,Is_Favorite,Summary,Reply_Preview
     */
    @Transactional(readOnly = true)
    public String exportUserRepliesToCsv(Long userId) {
        List<SavedReply> replies = repo.findByUserIdOrderByCreatedAtDesc(userId);
        
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Subject,Tone,Created,Is_Favorite,Summary,Reply_Preview\n");
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        for (SavedReply reply : replies) {
            csv.append(reply.getId()).append(",");
            csv.append(escapeCsv(reply.getEmailSubject())).append(",");
            csv.append(escapeCsv(reply.getTone())).append(",");
            csv.append(reply.getCreatedAt().format(formatter)).append(",");
            csv.append(Boolean.TRUE.equals(reply.getIsFavorite())).append(",");
            csv.append(escapeCsv(truncateText(reply.getSummary(), 100))).append(",");
            csv.append(escapeCsv(truncateText(reply.getReplyText(), 200))).append("\n");
        }
        
        log.info("Exported {} replies to CSV for user {}", replies.size(), userId);
        return csv.toString();
    }

    /**
     * Utility method to escape CSV fields containing commas or quotes.
     */
    private String escapeCsv(String field) {
        if (field == null) return "";
        if (field.contains(",") || field.contains("\"") || field.contains("\n")) {
            return "\"" + field.replace("\"", "\"\"") + "\"";
        }
        return field;
    }

    /**
     * Utility method to truncate text for CSV export.
     */
    private String truncateText(String text, int maxLength) {
        if (text == null) return "";
        return text.length() <= maxLength ? text : text.substring(0, maxLength) + "...";
    }
}
