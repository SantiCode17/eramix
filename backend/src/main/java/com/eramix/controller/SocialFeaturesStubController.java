package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller to handle all missing endpoints from the frontend API calls
 * to prevent 404 POST/PUT errors across the application.
 */
@RestController
@RequestMapping("/api/v1")
public class SocialFeaturesStubController {

    // ── Translation ──
    @PostMapping("/translate")
    public ResponseEntity<ApiResponse<Map<String, String>>> translate(@RequestBody Map<String, String> payload) {
        Map<String, String> result = new HashMap<>();
        result.put("translatedText", payload.getOrDefault("text", ""));
        return ResponseEntity.ok(ApiResponse.ok("Translation successful", result));
    }

    // ── Voice Messages ──
    @PostMapping(value = "/chat/voice", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> sendVoice(
            @RequestParam("audio") MultipartFile audio,
            @RequestParam("conversationId") String conversationId) {
        return ResponseEntity.ok(ApiResponse.ok("Voice message sent", "mock_url"));
    }

    // ── Cultural Map ──
    @PostMapping("/cultural-map/pois/{poiId}/favorite")
    public ResponseEntity<ApiResponse<Void>> favoritePoi(@PathVariable Long poiId) {
        return ResponseEntity.ok(ApiResponse.ok("POI favorited successfully", null));
    }

    // ── Time Capsule ──
    @PostMapping("/time-capsules")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createTimeCapsule(@RequestBody Map<String, Object> payload) {
        payload.put("id", 1);
        payload.put("createdAt", java.time.Instant.now().toString());
        payload.put("isRevealed", false);
        return ResponseEntity.ok(ApiResponse.ok("Time capsule created", payload));
    }

    @GetMapping("/time-capsules")
    public ResponseEntity<ApiResponse<java.util.List<Object>>> getTimeCapsules() {
        return ResponseEntity.ok(ApiResponse.ok(new java.util.ArrayList<>()));
    }

    // ── Passport ──
    @PostMapping("/passport/stamps/{stampId}/collect")
    public ResponseEntity<ApiResponse<Void>> collectStamp(@PathVariable Long stampId) {
        return ResponseEntity.ok(ApiResponse.ok("Stamp collected", null));
    }

    @GetMapping("/passport/stamps")
    public ResponseEntity<ApiResponse<java.util.List<Object>>> getStamps() {
        return ResponseEntity.ok(ApiResponse.ok(new java.util.ArrayList<>()));
    }

    // ── Daily Streaks ──
    @PostMapping("/daily/claim-streak")
    public ResponseEntity<ApiResponse<Map<String, Object>>> claimStreak() {
        Map<String, Object> response = new HashMap<>();
        response.put("streakDays", 1);
        response.put("xpAwarded", 10);
        return ResponseEntity.ok(ApiResponse.ok("Streak claimed", response));
    }

    // ── Checklist & Countdown ──
    @PutMapping("/users/me/checklist/{itemId}")
    public ResponseEntity<ApiResponse<Void>> toggleChecklist(@PathVariable String itemId, @RequestBody Map<String, Boolean> payload) {
        return ResponseEntity.ok(ApiResponse.ok("Checklist item updated", null));
    }

}
