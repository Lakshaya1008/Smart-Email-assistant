package com.email.writer.repository;

import com.email.writer.entity.SavedReply;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Enhanced repository interface for SavedReply entity with advanced query capabilities.
 * 
 * Spring Data JPA Repository Pattern:
 * - Automatic implementation generation by Spring
 * - Type-safe query methods
 * - Support for custom JPQL queries
 * - Built-in pagination and sorting
 * 
 * Query Optimization:
 * - Indexed searches on frequently queried fields
 * - JPQL for complex multi-criteria searches
 * - Lazy loading for performance
 */
@Repository
public interface SavedReplyRepository extends JpaRepository<SavedReply, Long> {

    /**
     * Find all replies for a user, ordered by creation date (newest first).
     * Standard Spring Data naming convention query.
     */
    List<SavedReply> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Paginated version of user replies query.
     * Essential for performance when users have many saved replies.
     */
    Page<SavedReply> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * Find favorite replies for a user.
     * Uses Boolean parameter to filter by favorite status.
     */
    List<SavedReply> findByUserIdAndIsFavoriteOrderByCreatedAtDesc(Long userId, Boolean isFavorite);

    /**
     * Full-text search across multiple fields.
     * 
     * JPQL Query Features:
     * - Case-insensitive search using LOWER()
     * - Multiple field search (subject, reply text, and summary)
     * - Wildcard matching with LIKE
     * - Parameter binding for SQL injection prevention
     */
    @Query("SELECT sr FROM SavedReply sr WHERE sr.user.id = :userId AND " +
           "(LOWER(sr.emailSubject) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(sr.replyText) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(sr.summary) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<SavedReply> findByUserIdAndSearchTerm(@Param("userId") Long userId,
                                             @Param("search") String search);

    /**
     * Enhanced search with tone filtering.
     * Combines full-text search with tone-based filtering.
     */
    @Query("SELECT sr FROM SavedReply sr WHERE sr.user.id = :userId AND " +
           "LOWER(sr.tone) = LOWER(:tone) AND " +
           "(LOWER(sr.emailSubject) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(sr.replyText) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(sr.summary) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<SavedReply> findByUserIdAndSearchTermAndTone(@Param("userId") Long userId,
                                                    @Param("search") String search,
                                                    @Param("tone") String tone);

    /**
     * Advanced filtering with multiple optional criteria.
     * 
     * Dynamic Query Construction:
     * - Handles null parameters gracefully
     * - Date range filtering
     * - Tone filtering
     * - Maintains ordering by creation date
     */
    @Query("SELECT sr FROM SavedReply sr WHERE sr.user.id = :userId " +
           "AND (:tone IS NULL OR LOWER(sr.tone) = LOWER(:tone)) " +
           "AND (:fromDate IS NULL OR sr.createdAt >= :fromDate) " +
           "AND (:toDate IS NULL OR sr.createdAt <= :toDate) " +
           "ORDER BY sr.createdAt DESC")
    List<SavedReply> findByUserIdWithFilters(@Param("userId") Long userId,
                                           @Param("tone") String tone,
                                           @Param("fromDate") LocalDateTime fromDate,
                                           @Param("toDate") LocalDateTime toDate);

    /**
     * Count total replies for a user.
     * Used for pagination calculations and user statistics.
     */
    long countByUserId(Long userId);

    /**
     * Get tone distribution for user statistics.
     * Groups replies by tone for analytics purposes.
     */
    @Query("SELECT sr.tone, COUNT(sr) FROM SavedReply sr WHERE sr.user.id = :userId " +
           "AND sr.tone IS NOT NULL " +
           "GROUP BY sr.tone " +
           "ORDER BY COUNT(sr) DESC")
    List<Object[]> getToneDistributionForUser(@Param("userId") Long userId);

    /**
     * Find most frequently used email subjects.
     * Helps identify common email patterns for the user.
     */
    @Query("SELECT sr.emailSubject, COUNT(sr) FROM SavedReply sr WHERE sr.user.id = :userId " +
           "AND sr.emailSubject IS NOT NULL " +
           "GROUP BY sr.emailSubject " +
           "ORDER BY COUNT(sr) DESC")
    List<Object[]> getMostCommonSubjectsForUser(@Param("userId") Long userId, Pageable pageable);
}