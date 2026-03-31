package com.eramix.repository;

import com.eramix.entity.ExchangeReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ExchangeReviewRepository extends JpaRepository<ExchangeReview, Long> {

    List<ExchangeReview> findAllByRevieweeIdOrderByCreatedAtDesc(Long revieweeId);

    Optional<ExchangeReview> findBySessionIdAndReviewerId(Long sessionId, Long reviewerId);

    boolean existsBySessionIdAndReviewerId(Long sessionId, Long reviewerId);

    @Query("SELECT AVG(r.rating) FROM ExchangeReview r WHERE r.reviewee.id = :userId")
    Double findAverageRatingByReviewee(Long userId);
}
