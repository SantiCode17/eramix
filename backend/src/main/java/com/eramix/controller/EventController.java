package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.PageResponse;
import com.eramix.dto.event.*;
import com.eramix.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    // ── 1. POST / ── Crear evento ─────────────────────────

    @PostMapping
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(
            @Valid @RequestBody EventRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok("Evento creado", eventService.createEvent(currentUserId(), request)));
    }

    // ── 2. GET /{id} ── Detalle de evento ─────────────────

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> getEvent(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(eventService.getEvent(id)));
    }

    // ── 3. PUT /{id} ── Actualizar evento ─────────────────

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok("Evento actualizado",
                        eventService.updateEvent(id, currentUserId(), request)));
    }

    // ── 4. DELETE /{id} ── Eliminar evento ────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id, currentUserId());
        return ResponseEntity.ok(ApiResponse.ok("Evento eliminado", null));
    }

    // ── 5. POST /{id}/join ── Unirse al evento ────────────

    @PostMapping("/{id}/join")
    public ResponseEntity<ApiResponse<EventParticipantResponse>> joinEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventParticipantRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok("Te has unido al evento",
                        eventService.joinEvent(id, currentUserId(), request.getStatus())));
    }

    // ── 6. DELETE /{id}/leave ── Salir del evento ─────────

    @DeleteMapping("/{id}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveEvent(@PathVariable Long id) {
        eventService.leaveEvent(id, currentUserId());
        return ResponseEntity.ok(ApiResponse.ok("Has salido del evento", null));
    }

    // ── 7. GET /{id}/participants ── Participantes ────────

    @GetMapping("/{id}/participants")
    public ResponseEntity<ApiResponse<List<EventParticipantResponse>>> getParticipants(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(eventService.getParticipants(id)));
    }

    // ── 8. GET /upcoming ── Eventos públicos próximos ─────

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<PageResponse<EventResponse>>> getUpcomingEvents(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
                ApiResponse.ok(eventService.getUpcomingEvents(category, page, size)));
    }

    // ── 9. GET /my-events ── Mis eventos creados ──────────

    @GetMapping("/my-events")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getMyEvents() {
        return ResponseEntity.ok(ApiResponse.ok(eventService.getMyEvents(currentUserId())));
    }

    // ── 10. GET /joined ── Eventos en los que participo ───

    @GetMapping("/joined")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getJoinedEvents() {
        return ResponseEntity.ok(ApiResponse.ok(eventService.getJoinedEvents(currentUserId())));
    }

    // ── Helper ────────────────────────────────────────────

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
