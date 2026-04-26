package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.places.*;
import com.eramix.service.UserPlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/places")
@RequiredArgsConstructor
public class UserPlaceController {

    private final UserPlaceService userPlaceService;

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserPlaceResponse>>> getPlaces() {
        return ResponseEntity.ok(ApiResponse.ok(
                userPlaceService.getPlaces(currentUserId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserPlaceResponse>> createPlace(
            @RequestBody CreateUserPlaceRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                userPlaceService.createPlace(currentUserId(), req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserPlaceResponse>> updatePlace(
            @PathVariable Long id,
            @RequestBody UpdateUserPlaceRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                userPlaceService.updatePlace(id, currentUserId(), req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePlace(@PathVariable Long id) {
        userPlaceService.deletePlace(id, currentUserId());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
