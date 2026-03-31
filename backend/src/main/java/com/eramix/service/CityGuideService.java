package com.eramix.service;

import com.eramix.dto.cityguide.*;
import com.eramix.entity.Place;
import com.eramix.entity.PlaceReview;
import com.eramix.entity.enums.PlaceCategory;
import com.eramix.repository.PlaceRepository;
import com.eramix.repository.PlaceReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CityGuideService {

    private final PlaceRepository placeRepository;
    private final PlaceReviewRepository reviewRepository;

    // ── Places ──────────────────────────────────────

    public List<PlaceResponse> getPlaces(String city, PlaceCategory category) {
        List<Place> places;
        if (city != null && category != null) {
            places = placeRepository.findByCityIgnoreCaseAndCategoryOrderByCreatedAtDesc(city, category);
        } else if (city != null) {
            places = placeRepository.findByCityIgnoreCaseOrderByCreatedAtDesc(city);
        } else if (category != null) {
            places = placeRepository.findByCategoryOrderByCreatedAtDesc(category);
        } else {
            places = placeRepository.findAllByOrderByCreatedAtDesc();
        }
        return places.stream().map(this::toPlaceResponse).toList();
    }

    public PlaceResponse getPlace(Long id) {
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Place not found"));
        return toPlaceResponse(place);
    }

    @Transactional
    public PlaceResponse createPlace(Long userId, CreatePlaceRequest req) {
        Place place = Place.builder()
                .name(req.getName())
                .description(req.getDescription())
                .category(req.getCategory())
                .address(req.getAddress())
                .city(req.getCity())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .imageUrl(req.getImageUrl())
                .userId(userId)
                .build();
        return toPlaceResponse(placeRepository.save(place));
    }

    // ── Reviews ─────────────────────────────────────

    public List<ReviewResponse> getReviews(Long placeId) {
        return reviewRepository.findByPlaceIdOrderByCreatedAtDesc(placeId)
                .stream().map(this::toReviewResponse).toList();
    }

    @Transactional
    public ReviewResponse addReview(Long placeId, Long userId, CreateReviewRequest req) {
        // verify place exists
        placeRepository.findById(placeId)
                .orElseThrow(() -> new RuntimeException("Place not found"));

        PlaceReview review = PlaceReview.builder()
                .placeId(placeId)
                .userId(userId)
                .rating(req.getRating())
                .comment(req.getComment())
                .build();
        return toReviewResponse(reviewRepository.save(review));
    }

    // ── Mappers ─────────────────────────────────────

    private PlaceResponse toPlaceResponse(Place p) {
        return PlaceResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .category(p.getCategory())
                .address(p.getAddress())
                .city(p.getCity())
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .imageUrl(p.getImageUrl())
                .userId(p.getUserId())
                .averageRating(reviewRepository.findAverageRatingByPlaceId(p.getId()))
                .reviewCount(reviewRepository.countByPlaceId(p.getId()))
                .createdAt(p.getCreatedAt())
                .build();
    }

    private ReviewResponse toReviewResponse(PlaceReview r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .placeId(r.getPlaceId())
                .userId(r.getUserId())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
