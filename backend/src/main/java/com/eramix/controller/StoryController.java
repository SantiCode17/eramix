package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.story.StoryReactionRequest;
import com.eramix.dto.story.StoryReactionResponse;
import com.eramix.dto.story.StoryResponse;
import com.eramix.service.StoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stories")
@RequiredArgsConstructor
public class StoryController {

    private final StoryService storyService;

    // ── 1. POST / ── Crear story con upload ───────────────

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<StoryResponse>> createStory(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption) {
        return ResponseEntity.ok(
                ApiResponse.ok("Story creada", storyService.createStory(currentUserId(), file, caption)));
    }

    // ── 2. DELETE /{id} ── Eliminar story ─────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStory(@PathVariable Long id) {
        storyService.deleteStory(id, currentUserId());
        return ResponseEntity.ok(ApiResponse.ok("Story eliminada", null));
    }

    // ── 3. POST /{id}/view ── Registrar visualización ────

    @PostMapping("/{id}/view")
    public ResponseEntity<ApiResponse<Void>> viewStory(@PathVariable Long id) {
        storyService.viewStory(id, currentUserId());
        return ResponseEntity.ok(ApiResponse.ok("Story vista registrada", null));
    }

    // ── 4. GET /feed ── Stories activas (amigos + propias)

    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<List<StoryResponse>>> getStoryFeed() {
        return ResponseEntity.ok(ApiResponse.ok(storyService.getStoryFeed(currentUserId())));
    }

    // ── 5. GET /user/{userId} ── Stories de un usuario ────

    @GetMapping("/user/{targetUserId}")
    public ResponseEntity<ApiResponse<List<StoryResponse>>> getUserStories(
            @PathVariable Long targetUserId) {
        return ResponseEntity.ok(
                ApiResponse.ok(storyService.getUserStories(targetUserId, currentUserId())));
    }

    // ── 6. POST /{id}/react ── Reaccionar a una story ────

    @PostMapping("/{id}/react")
    public ResponseEntity<ApiResponse<StoryReactionResponse>> reactToStory(
            @PathVariable Long id,
            @Valid @RequestBody StoryReactionRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok("Reacción registrada",
                        storyService.reactToStory(id, currentUserId(), request.getEmoji())));
    }

    // ── Helper ────────────────────────────────────────────

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
