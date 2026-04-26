package com.eramix.repository;

import com.eramix.entity.WellbeingCheckin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.Instant;
import java.util.List;

public interface WellbeingCheckinRepository extends JpaRepository<WellbeingCheckin, Long> {
    List<WellbeingCheckin> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT w FROM WellbeingCheckin w WHERE w.userId = :userId AND w.createdAt >= :since ORDER BY w.createdAt ASC")
    List<WellbeingCheckin> findByUserIdSince(Long userId, Instant since);

    @Query("SELECT AVG(w.moodScore) FROM WellbeingCheckin w WHERE w.userId = :userId AND w.createdAt >= :since")
    Double averageMoodSince(Long userId, Instant since);

    @Query("SELECT COUNT(w) FROM WellbeingCheckin w WHERE w.userId = :userId AND w.createdAt >= :since")
    Long countCheckinsSince(Long userId, Instant since);
}
