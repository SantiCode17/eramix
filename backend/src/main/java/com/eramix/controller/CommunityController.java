package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.community.*;
import com.eramix.entity.enums.CommunityCategory;
import com.eramix.service.CommunityService;
import com.eramix.service.FileStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/communities")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;
    private final FileStorageService fileStorageService;

    // ── 1. GET / ── Listar comunidades (con filtros) ──────

    @GetMapping
    public ResponseEntity<ApiResponse<List<CommunityResponse>>> getCommunities(
            @RequestParam(required = false) CommunityCategory category,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(
                ApiResponse.ok(communityService.getCommunities(category, q, currentUserId())));
    }

    // ── 2. GET /my ── Mis comunidades ─────────────────────

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<CommunityResponse>>> getMyCommunities() {
        return ResponseEntity.ok(
                ApiResponse.ok(communityService.getMyCommunities(currentUserId())));
    }

    // ── 3. GET /suggested ── Comunidades sugeridas ────────

    @GetMapping("/suggested")
    public ResponseEntity<ApiResponse<List<CommunityResponse>>> getSuggestedCommunities() {
        return ResponseEntity.ok(
                ApiResponse.ok(communityService.getSuggestedCommunities(currentUserId())));
    }

    // ── 4. GET /{id} ── Detalle de comunidad ──────────────

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CommunityResponse>> getCommunity(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.ok(communityService.getCommunityById(id, currentUserId())));
    }

    // ── 4b. POST / ── Crear comunidad ─────────────────────

    @PostMapping
    public ResponseEntity<ApiResponse<CommunityResponse>> createCommunity(
            @Valid @RequestBody CreateCommunityRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok("Comunidad creada con éxito",
                        communityService.createCommunity(currentUserId(), request)));
    }

    // ── 5. POST /{id}/join ── Unirse a comunidad ──────────

    @PostMapping("/{id}/join")
    public ResponseEntity<ApiResponse<CommunityResponse>> joinCommunity(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.ok("Te has unido a la comunidad",
                        communityService.joinCommunity(id, currentUserId())));
    }

    // ── 6. DELETE /{id}/leave ── Salir de comunidad ───────

    @DeleteMapping("/{id}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveCommunity(@PathVariable Long id) {
        communityService.leaveCommunity(id, currentUserId());
        return ResponseEntity.ok(ApiResponse.ok("Has salido de la comunidad", null));
    }

    // ── 7. GET /{id}/posts ── Posts de la comunidad ───────

    @GetMapping("/{id}/posts")
    public ResponseEntity<ApiResponse<Page<CommunityPostResponse>>> getCommunityPosts(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
                ApiResponse.ok(communityService.getCommunityPosts(id, currentUserId(), page, size)));
    }

    // ── 8. POST /{id}/posts ── Crear post ─────────────────

    @PostMapping("/{id}/posts")
    public ResponseEntity<ApiResponse<CommunityPostResponse>> createPost(
            @PathVariable Long id,
            @Valid @RequestBody CreatePostRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok("Post publicado",
                        communityService.createPost(id, currentUserId(), request)));
    }

    // ── 9. POST /{id}/posts/{postId}/like ── Like/Unlike ──

    @PostMapping("/{id}/posts/{postId}/like")
    public ResponseEntity<ApiResponse<CommunityPostResponse>> toggleLike(
            @PathVariable Long id,
            @PathVariable Long postId) {
        return ResponseEntity.ok(
                ApiResponse.ok(communityService.toggleLike(id, postId, currentUserId())));
    }

    // ── 10. POST /{id}/posts/{postId}/comments ── Comentar

    @PostMapping("/{id}/posts/{postId}/comments")
    public ResponseEntity<ApiResponse<CommunityCommentResponse>> createComment(
            @PathVariable Long id,
            @PathVariable Long postId,
            @Valid @RequestBody CreateCommentRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok("Comentario agregado",
                        communityService.createComment(id, postId, currentUserId(), request)));
    }

    // ── 11. POST /{id}/posts/upload-image ── Upload imagen de post

    @PostMapping(value = "/{id}/posts/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadPostImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        String url = fileStorageService.storePhoto(file);
        return ResponseEntity.ok(ApiResponse.ok("Imagen subida", Map.of("url", url)));
    }

    // ── Helper ────────────────────────────────────────────

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
