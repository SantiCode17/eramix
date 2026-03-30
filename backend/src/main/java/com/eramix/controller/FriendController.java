package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.social.*;
import com.eramix.service.FriendService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    // ── 1. POST /requests ── Enviar solicitud ─────────────

    @PostMapping("/requests")
    public ResponseEntity<ApiResponse<FriendRequestResponse>> sendRequest(
            @Valid @RequestBody FriendRequestCreate request) {
        return ResponseEntity.ok(
                ApiResponse.ok("Solicitud enviada",
                        friendService.sendRequest(currentUserId(), request.getReceiverId())));
    }

    // ── 2. GET /requests/received ── Solicitudes recibidas

    @GetMapping("/requests/received")
    public ResponseEntity<ApiResponse<List<FriendRequestResponse>>> getReceivedRequests() {
        return ResponseEntity.ok(ApiResponse.ok(friendService.getReceivedRequests(currentUserId())));
    }

    // ── 3. GET /requests/sent ── Solicitudes enviadas ────

    @GetMapping("/requests/sent")
    public ResponseEntity<ApiResponse<List<FriendRequestResponse>>> getSentRequests() {
        return ResponseEntity.ok(ApiResponse.ok(friendService.getSentRequests(currentUserId())));
    }

    // ── 4. PUT /requests/{id} ── Aceptar / Rechazar ──────

    @PutMapping("/requests/{id}")
    public ResponseEntity<ApiResponse<FriendRequestResponse>> respondToRequest(
            @PathVariable Long id,
            @Valid @RequestBody FriendRequestAction action) {
        return ResponseEntity.ok(
                ApiResponse.ok("Solicitud procesada",
                        friendService.respondToRequest(id, currentUserId(), action.getAction())));
    }

    // ── 5. DELETE /requests/{id} ── Cancelar solicitud ───

    @DeleteMapping("/requests/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelRequest(@PathVariable Long id) {
        friendService.cancelRequest(id, currentUserId());
        return ResponseEntity.ok(ApiResponse.ok("Solicitud cancelada", null));
    }

    // ── 6. GET / ── Listar amigos ─────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<List<FriendshipResponse>>> getFriends() {
        return ResponseEntity.ok(ApiResponse.ok(friendService.getFriends(currentUserId())));
    }

    // ── 7. DELETE /{friendId} ── Eliminar amigo ───────────

    @DeleteMapping("/{friendId}")
    public ResponseEntity<ApiResponse<Void>> removeFriend(@PathVariable Long friendId) {
        friendService.removeFriend(currentUserId(), friendId);
        return ResponseEntity.ok(ApiResponse.ok("Amigo eliminado", null));
    }

    // ── 8. POST /block/{userId} ── Bloquear usuario ──────

    @PostMapping("/block/{blockedId}")
    public ResponseEntity<ApiResponse<Void>> blockUser(@PathVariable Long blockedId) {
        friendService.blockUser(currentUserId(), blockedId);
        return ResponseEntity.ok(ApiResponse.ok("Usuario bloqueado", null));
    }

    // ── 9. DELETE /block/{userId} ── Desbloquear usuario ─

    @DeleteMapping("/block/{blockedId}")
    public ResponseEntity<ApiResponse<Void>> unblockUser(@PathVariable Long blockedId) {
        friendService.unblockUser(currentUserId(), blockedId);
        return ResponseEntity.ok(ApiResponse.ok("Usuario desbloqueado", null));
    }

    // ── 10. GET /blocked ── Listar usuarios bloqueados ───

    @GetMapping("/blocked")
    public ResponseEntity<ApiResponse<List<FriendRequestResponse>>> getBlockedUsers() {
        return ResponseEntity.ok(ApiResponse.ok(friendService.getBlockedUsers(currentUserId())));
    }

    // ── Helper ────────────────────────────────────────────

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
