package com.eramix.service;

import com.eramix.dto.location.LiveLocationResponse;
import com.eramix.dto.location.StartSharingRequest;
import com.eramix.entity.Friendship;
import com.eramix.entity.User;
import com.eramix.exception.UserNotFoundException;
import com.eramix.repository.FriendshipRepository;
import com.eramix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * In-memory live location service.
 * Stores active sharing sessions and broadcasts updates via WebSocket.
 * Sessions auto-expire after their configured duration.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LiveLocationService {

    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /** userId → active sharing session */
    private final Map<Long, LocationSession> activeSessions = new ConcurrentHashMap<>();

    // ── Inner class for session state ─────────────────

    private static class LocationSession {
        Long userId;
        String firstName;
        String lastName;
        String profilePhotoUrl;
        double latitude;
        double longitude;
        Instant expiresAt;
        Instant updatedAt;

        LiveLocationResponse toResponse() {
            return LiveLocationResponse.builder()
                    .userId(userId)
                    .firstName(firstName)
                    .lastName(lastName)
                    .profilePhotoUrl(profilePhotoUrl)
                    .latitude(latitude)
                    .longitude(longitude)
                    .expiresAt(expiresAt)
                    .updatedAt(updatedAt)
                    .active(true)
                    .build();
        }
    }

    // ── Start sharing ─────────────────────────────────

    public LiveLocationResponse startSharing(Long userId, StartSharingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        int minutes = request.getDurationMinutes() != null ? request.getDurationMinutes() : 30;

        LocationSession session = new LocationSession();
        session.userId = userId;
        session.firstName = user.getFirstName();
        session.lastName = user.getLastName();
        session.profilePhotoUrl = user.getProfilePhotoUrl();
        session.latitude = request.getLatitude();
        session.longitude = request.getLongitude();
        session.expiresAt = Instant.now().plusSeconds(minutes * 60L);
        session.updatedAt = Instant.now();

        activeSessions.put(userId, session);
        log.info("User {} started sharing location for {} min", userId, minutes);

        // Notify friends that this user started sharing
        broadcastToFriends(userId, session.toResponse());

        return session.toResponse();
    }

    // ── Stop sharing ──────────────────────────────────

    public void stopSharing(Long userId) {
        LocationSession removed = activeSessions.remove(userId);
        if (removed != null) {
            log.info("User {} stopped sharing location", userId);
            // Notify friends that this user stopped
            LiveLocationResponse stoppedResponse = removed.toResponse();
            stoppedResponse.setActive(false);
            broadcastToFriends(userId, stoppedResponse);
        }
    }

    // ── Update location (called from WebSocket) ──────

    public void updateLocation(Long userId, Double lat, Double lng) {
        LocationSession session = activeSessions.get(userId);
        if (session == null) return;

        // Check expiry
        if (Instant.now().isAfter(session.expiresAt)) {
            stopSharing(userId);
            return;
        }

        session.latitude = lat;
        session.longitude = lng;
        session.updatedAt = Instant.now();

        // Broadcast update to all friends
        broadcastToFriends(userId, session.toResponse());
    }

    // ── Get active friend locations ───────────────────

    public List<LiveLocationResponse> getActiveFriendLocations(Long userId) {
        Set<Long> friendIds = getFriendIds(userId);

        return activeSessions.values().stream()
                .filter(s -> friendIds.contains(s.userId))
                .filter(s -> Instant.now().isBefore(s.expiresAt))
                .map(LocationSession::toResponse)
                .collect(Collectors.toList());
    }

    // ── Get my status ─────────────────────────────────

    public LiveLocationResponse getMyStatus(Long userId) {
        LocationSession session = activeSessions.get(userId);
        if (session == null || Instant.now().isAfter(session.expiresAt)) {
            return LiveLocationResponse.builder()
                    .userId(userId)
                    .active(false)
                    .build();
        }
        return session.toResponse();
    }

    // ── Scheduled cleanup of expired sessions ─────────

    @Scheduled(fixedRate = 30_000)
    public void cleanupExpiredSessions() {
        Instant now = Instant.now();
        activeSessions.entrySet().removeIf(entry -> {
            if (now.isAfter(entry.getValue().expiresAt)) {
                log.debug("Auto-expired location session for user {}", entry.getKey());
                LiveLocationResponse expired = entry.getValue().toResponse();
                expired.setActive(false);
                broadcastToFriends(entry.getKey(), expired);
                return true;
            }
            return false;
        });
    }

    // ── Broadcast to all friends via WebSocket ────────

    private void broadcastToFriends(Long userId, LiveLocationResponse update) {
        Set<Long> friendIds = getFriendIds(userId);
        for (Long friendId : friendIds) {
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(friendId),
                    "/queue/location",
                    update
            );
        }
    }

    // ── Get friend IDs ────────────────────────────────

    private Set<Long> getFriendIds(Long userId) {
        List<Friendship> friendships = friendshipRepository.findAllByUserId(userId);
        return friendships.stream()
                .map(f -> f.getUser1().getId().equals(userId)
                        ? f.getUser2().getId()
                        : f.getUser1().getId())
                .collect(Collectors.toSet());
    }
}
