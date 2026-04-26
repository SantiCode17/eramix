package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.PageResponse;
import com.eramix.dto.event.EventResponse;
import com.eramix.dto.user.NearbyUserResponse;
import com.eramix.dto.user.UserProfileResponse;
import com.eramix.dto.user.UserSearchRequest;
import com.eramix.service.EventService;
import com.eramix.service.SearchService;
import io.micrometer.core.instrument.Counter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;
    private final EventService eventService;
    private final Counter searchesPerformedCounter;

    // ── 1. POST / ── Búsqueda combinada con filtros ───────

    @PostMapping
    public ResponseEntity<ApiResponse<PageResponse<UserProfileResponse>>> searchUsers(
            @RequestBody UserSearchRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(searchService.searchUsers(request, currentUserId())));
    }

    // ── 2. GET /nearby ── Usuarios cercanos (Haversine) ───

    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<NearbyUserResponse>>> findNearbyUsers(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "50") Double radiusKm) {
        return ResponseEntity.ok(
                ApiResponse.ok(searchService.findNearbyUsers(latitude, longitude, radiusKm, currentUserId())));
    }

    // ── 3. GET /by-city ── Usuarios por ciudad ────────────

    @GetMapping("/by-city")
    public ResponseEntity<ApiResponse<List<UserProfileResponse>>> findByCity(
            @RequestParam String city) {
        return ResponseEntity.ok(ApiResponse.ok(searchService.findByCity(city, currentUserId())));
    }

    // ── 4. GET /by-country ── Usuarios por país ───────────

    @GetMapping("/by-country")
    public ResponseEntity<ApiResponse<List<UserProfileResponse>>> findByCountry(
            @RequestParam String country) {
        return ResponseEntity.ok(ApiResponse.ok(searchService.findByCountry(country, currentUserId())));
    }

    // ── 5. GET /global ── Búsqueda global multi-categoría

    @GetMapping("/global")
    public ResponseEntity<ApiResponse<Map<String, Object>>> globalSearch(
            @RequestParam String q,
            @RequestParam(defaultValue = "20") int size) {
        searchesPerformedCounter.increment();
        // Buscar personas
        UserSearchRequest userReq = new UserSearchRequest();
        userReq.setDestinationCity(q);
        userReq.setPage(0);
        userReq.setSize(size);
        PageResponse<UserProfileResponse> users = searchService.searchUsers(userReq, currentUserId());

        // Buscar eventos (query en DB, no en memoria)
        PageResponse<EventResponse> events = eventService.searchEvents(q, 0, size);

        Map<String, Object> result = Map.of(
                "users", users.getContent(),
                "events", events.getContent(),
                "query", q
        );

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    // ── Helper ────────────────────────────────────────────

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
