package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.user.*;
import com.eramix.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ── 1. GET /me ── Mi perfil ───────────────────────────

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getMyProfile(currentUserId())));
    }

    // ── 2. GET /{id} ── Perfil público ────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getProfile(id)));
    }

    // ── 3. PUT /me ── Actualizar perfil ───────────────────

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok("Perfil actualizado",
                        userService.updateProfile(currentUserId(), request)));
    }

    // ── 4. PUT /me/photo ── Foto de perfil ────────────────

    @PutMapping(value = "/me/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfilePhoto(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(
                ApiResponse.ok("Foto de perfil actualizada",
                        userService.updateProfilePhoto(currentUserId(), file)));
    }

    // ── 5. POST /me/photos ── Añadir foto adicional ──────

    @PostMapping(value = "/me/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserPhotoResponse>> addPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder) {
        return ResponseEntity.ok(
                ApiResponse.ok("Foto añadida",
                        userService.addPhoto(currentUserId(), file, displayOrder)));
    }

    // ── 6. DELETE /me/photos/{photoId} ── Eliminar foto ──

    @DeleteMapping("/me/photos/{photoId}")
    public ResponseEntity<ApiResponse<Void>> deletePhoto(@PathVariable Long photoId) {
        userService.deletePhoto(currentUserId(), photoId);
        return ResponseEntity.ok(ApiResponse.ok("Foto eliminada", null));
    }

    // ── 7. GET /me/photos ── Listar mis fotos ────────────

    @GetMapping("/me/photos")
    public ResponseEntity<ApiResponse<List<UserPhotoResponse>>> getMyPhotos() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getPhotos(currentUserId())));
    }

    // ── 8. PUT /me/location ── Actualizar ubicación ──────

    @PutMapping("/me/location")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateLocation(
            @Valid @RequestBody LocationUpdateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok("Ubicación actualizada",
                        userService.updateLocation(currentUserId(), request)));
    }

    // ── Helper ────────────────────────────────────────────

    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (Long) auth.getPrincipal();
    }
}
