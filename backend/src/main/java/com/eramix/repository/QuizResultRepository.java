package com.eramix.repository;

import com.eramix.entity.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {

    List<QuizResult> findByUserIdOrderByCompletedAtDesc(Long userId);

    @Query("SELECT COUNT(r) FROM QuizResult r WHERE r.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(r.xpEarned), 0) FROM QuizResult r WHERE r.user.id = :userId")
    int totalXpEarnedByUser(@Param("userId") Long userId);
}
