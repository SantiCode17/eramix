package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.messaging.ConversationResponse;
import com.eramix.dto.messaging.MessageResponse;
import com.eramix.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ChatService chatService;

    // ── 1. GET / ── Listar conversaciones ─────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getConversations() {
        return ResponseEntity.ok(
                ApiResponse.ok(chatService.getConversations(currentUserId())));
    }

    // ── 2. GET /{id} ── Detalle de conversación ───────────

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ConversationResponse>> getConversation(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.ok(chatService.getConversation(id, currentUserId())));
    }

    // ── 3. GET /{id}/messages ── Mensajes (cursor-based) ──

    @GetMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getMessages(
            @PathVariable Long id,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "30") int size) {
        return ResponseEntity.ok(
                ApiResponse.ok(chatService.getMessages(id, currentUserId(), cursor, size)));
    }

    // ── 4. PUT /{id}/read ── Marcar como leídos ───────────

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Integer>> markAsRead(@PathVariable Long id) {
        int count = chatService.markAsRead(id, currentUserId());
        return ResponseEntity.ok(
                ApiResponse.ok(count + " mensajes marcados como leídos", count));
    }

    // ── Helper ────────────────────────────────────────────

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
