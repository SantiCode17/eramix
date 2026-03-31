package com.eramix.repository;

import com.eramix.entity.PlaceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface PlaceReviewRepository extends JpaRepository<PlaceReview, Long> {
    List<PlaceReview> findByPlaceIdOrderByCreatedAtDesc(Long placeId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM PlaceReview r WHERE r.placeId = :placeId")
    Double findAverageRatingByPlaceId(Long placeId);

    Integer countByPlaceId(Long placeId);
}
