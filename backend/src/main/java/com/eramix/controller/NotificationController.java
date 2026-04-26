package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.PageResponse;
import com.eramix.dto.notification.NotificationResponse;
import com.eramix.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // ── 1. GET / ── Listar notificaciones (paginadas) ─────

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String type) {
        PageResponse<NotificationResponse> result = (type != null && !type.isBlank())
                ? notificationService.getNotificationsByType(currentUserId(), type, page, size)
                : notificationService.getNotifications(currentUserId(), page, size);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    // ── 2. GET /unread-count ── Contar no leídas ──────────

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        return ResponseEntity.ok(
                ApiResponse.ok(notificationService.getUnreadCount(currentUserId())));
    }

    // ── 3. PUT /{id}/read ── Marcar una como leída ────────

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.ok("Notificación marcada como leída",
                        notificationService.markAsRead(id, currentUserId())));
    }

    // ── 4. PUT /read-all ── Marcar todas como leídas ──────

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Integer>> markAllAsRead() {
        int count = notificationService.markAllAsRead(currentUserId());
        return ResponseEntity.ok(
                ApiResponse.ok(count + " notificaciones marcadas como leídas", count));
    }

    // ── 5. DELETE /{id} ── Eliminar notificación ──────────

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id, currentUserId());
        return ResponseEntity.ok(ApiResponse.ok("Notificación eliminada", null));
    }

    // ── Helper ────────────────────────────────────────────

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
