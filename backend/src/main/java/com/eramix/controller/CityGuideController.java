package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.cityguide.*;
import com.eramix.entity.enums.PlaceCategory;
import com.eramix.service.CityGuideService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/city-guide")
@RequiredArgsConstructor
public class CityGuideController {

    private final CityGuideService cityGuideService;

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    // ── Places ──────────────────────────────────────

    @GetMapping("/places")
    public ResponseEntity<ApiResponse<List<PlaceResponse>>> getPlaces(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) PlaceCategory category) {
        return ResponseEntity.ok(ApiResponse.ok(cityGuideService.getPlaces(city, category)));
    }

    @GetMapping("/places/{id}")
    public ResponseEntity<ApiResponse<PlaceResponse>> getPlace(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(cityGuideService.getPlace(id)));
    }

    @PostMapping("/places")
    public ResponseEntity<ApiResponse<PlaceResponse>> createPlace(@RequestBody CreatePlaceRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(cityGuideService.createPlace(currentUserId(), req)));
    }

    // ── Reviews ─────────────────────────────────────

    @GetMapping("/places/{placeId}/reviews")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviews(@PathVariable Long placeId) {
        return ResponseEntity.ok(ApiResponse.ok(cityGuideService.getReviews(placeId)));
    }

    @PostMapping("/places/{placeId}/reviews")
    public ResponseEntity<ApiResponse<ReviewResponse>> addReview(
            @PathVariable Long placeId,
            @RequestBody CreateReviewRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(cityGuideService.addReview(placeId, currentUserId(), req)));
    }
}
