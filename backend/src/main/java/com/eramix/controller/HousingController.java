package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.housing.*;
import com.eramix.service.HousingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/housing")
@RequiredArgsConstructor
public class HousingController {

    private final HousingService housingService;

    private Long currentUserId() {
        return Long.parseLong(SecurityContextHolder.getContext().getAuthentication().getName());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HousingPostResponse>> create(@Valid @RequestBody CreateHousingPostRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(housingService.createPost(currentUserId(), req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HousingPostResponse>>> getAll(@RequestParam(required = false) String city) {
        List<HousingPostResponse> posts = city != null
                ? housingService.getByCity(city)
                : housingService.getAllActive();
        return ResponseEntity.ok(ApiResponse.ok(posts));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<HousingPostResponse>>> getMine() {
        return ResponseEntity.ok(ApiResponse.ok(housingService.getMyPosts(currentUserId())));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<ApiResponse<String>> deactivate(@PathVariable Long postId) {
        housingService.deactivatePost(currentUserId(), postId);
        return ResponseEntity.ok(ApiResponse.ok("Deactivated", "success"));
    }
}
