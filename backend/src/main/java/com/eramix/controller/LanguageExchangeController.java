package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.exchange.*;
import com.eramix.service.LanguageExchangeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/exchange")
@RequiredArgsConstructor
public class LanguageExchangeController {

    private final LanguageExchangeService exchangeService;

    // ── Partners ────────────────────────────────────────

    @GetMapping("/partners")
    public ResponseEntity<ApiResponse<List<ExchangePartnerResponse>>> findPartners() {
        return ResponseEntity.ok(ApiResponse.ok(exchangeService.findPartners(currentUserId())));
    }

    // ── Requests ────────────────────────────────────────

    @PostMapping("/requests")
    public ResponseEntity<ApiResponse<ExchangeRequestResponse>> createRequest(
            @Valid @RequestBody ExchangeRequestDTO dto) {
        return ResponseEntity.ok(
                ApiResponse.ok("Solicitud enviada", exchangeService.createRequest(currentUserId(), dto)));
    }

    @GetMapping("/requests/received")
    public ResponseEntity<ApiResponse<List<ExchangeRequestResponse>>> pendingReceived() {
        return ResponseEntity.ok(ApiResponse.ok(exchangeService.getPendingReceived(currentUserId())));
    }

    @GetMapping("/requests/sent")
    public ResponseEntity<ApiResponse<List<ExchangeRequestResponse>>> sentRequests() {
        return ResponseEntity.ok(ApiResponse.ok(exchangeService.getMySentRequests(currentUserId())));
    }

    @PutMapping("/requests/{id}/accept")
    public ResponseEntity<ApiResponse<ExchangeRequestResponse>> accept(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.ok("Solicitud aceptada", exchangeService.acceptRequest(id, currentUserId())));
    }

    @PutMapping("/requests/{id}/reject")
    public ResponseEntity<ApiResponse<ExchangeRequestResponse>> reject(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.ok("Solicitud rechazada", exchangeService.rejectRequest(id, currentUserId())));
    }

    // ── Sessions ────────────────────────────────────────

    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<ExchangeSessionResponse>> scheduleSession(
            @Valid @RequestBody ScheduleSessionRequest dto) {
        return ResponseEntity.ok(
                ApiResponse.ok("Sesión agendada", exchangeService.scheduleSession(currentUserId(), dto)));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<ExchangeSessionResponse>>> mySessions() {
        return ResponseEntity.ok(ApiResponse.ok(exchangeService.getMySessions(currentUserId())));
    }

    @PutMapping("/sessions/{id}/complete")
    public ResponseEntity<ApiResponse<ExchangeSessionResponse>> complete(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.ok("Sesión completada", exchangeService.completeSession(id, currentUserId())));
    }

    @PutMapping("/sessions/{id}/cancel")
    public ResponseEntity<ApiResponse<ExchangeSessionResponse>> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.ok("Sesión cancelada", exchangeService.cancelSession(id, currentUserId())));
    }

    // ── Reviews ─────────────────────────────────────────

    @PostMapping("/reviews")
    public ResponseEntity<ApiResponse<ExchangeReviewResponse>> createReview(
            @Valid @RequestBody ExchangeReviewRequest dto) {
        return ResponseEntity.ok(
                ApiResponse.ok("Valoración registrada", exchangeService.createReview(currentUserId(), dto)));
    }

    @GetMapping("/reviews/{userId}")
    public ResponseEntity<ApiResponse<List<ExchangeReviewResponse>>> getUserReviews(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(exchangeService.getReviewsForUser(userId)));
    }

    // ── Helpers ─────────────────────────────────────────

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
