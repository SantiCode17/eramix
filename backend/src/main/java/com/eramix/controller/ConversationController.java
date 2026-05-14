package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.messaging.ConversationResponse;
import com.eramix.dto.messaging.MessageResponse;
import com.eramix.service.ChatService;
import com.eramix.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ChatService chatService;
    private final FileStorageService fileStorageService;

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

    // ── 5. POST /{id}/messages/image ── Enviar imagen ────

    @PostMapping(value = "/{id}/messages/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MessageResponse>> sendImageMessage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption) {
        String mediaUrl = fileStorageService.storePhoto(file);
        MessageResponse msg = chatService.saveImageMessage(id, currentUserId(), mediaUrl, caption);
        return ResponseEntity.ok(ApiResponse.ok("Imagen enviada", msg));
    }

    // ── 6. POST /{id}/messages/audio ── Enviar audio ────

    @PostMapping(value = "/{id}/messages/audio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MessageResponse>> sendAudioMessage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        String mediaUrl = fileStorageService.storeAudio(file);
        MessageResponse msg = chatService.saveAudioMessage(id, currentUserId(), mediaUrl);
        return ResponseEntity.ok(ApiResponse.ok("Audio enviado", msg));
    }

    // ── Helper ────────────────────────────────────────────

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
