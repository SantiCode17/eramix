package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.location.*;
import com.eramix.service.LiveLocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST + WebSocket controller for real-time live location sharing.
 *
 * REST endpoints handle start/stop sharing and querying active sharers.
 * STOMP endpoints handle real-time coordinate updates.
 */
@RestController
@RequestMapping("/api/v1/location")
@RequiredArgsConstructor
public class LiveLocationController {

    private final LiveLocationService locationService;

    // ── REST: Start sharing location ──────────────────

    @PostMapping("/share")
    public ResponseEntity<ApiResponse<LiveLocationResponse>> startSharing(
            @Valid @RequestBody StartSharingRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok("Compartiendo ubicación",
                        locationService.startSharing(currentUserId(), request)));
    }

    // ── REST: Stop sharing location ───────────────────

    @DeleteMapping("/share")
    public ResponseEntity<ApiResponse<Void>> stopSharing() {
        locationService.stopSharing(currentUserId());
        return ResponseEntity.ok(ApiResponse.ok("Ubicación detenida", null));
    }

    // ── REST: Get active friends sharing location ─────

    @GetMapping("/friends")
    public ResponseEntity<ApiResponse<List<LiveLocationResponse>>> getFriendLocations() {
        return ResponseEntity.ok(
                ApiResponse.ok(locationService.getActiveFriendLocations(currentUserId())));
    }

    // ── REST: Get my current sharing status ───────────

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<LiveLocationResponse>> getMyStatus() {
        return ResponseEntity.ok(
                ApiResponse.ok(locationService.getMyStatus(currentUserId())));
    }

    // ── STOMP: Real-time location update ──────────────

    @MessageMapping("/location.update")
    public void updateLocation(@Payload LocationUpdateMessage update,
                               SimpMessageHeaderAccessor headerAccessor) {
        Long userId = extractUserId(headerAccessor);
        if (userId != null) {
            locationService.updateLocation(userId, update.getLatitude(), update.getLongitude());
        }
    }

    // ── Helpers ───────────────────────────────────────

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private Long extractUserId(SimpMessageHeaderAccessor accessor) {
        if (accessor.getUser() != null) {
            try {
                return Long.parseLong(accessor.getUser().getName());
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}
