package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.group.*;
import com.eramix.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    // ── 1. POST / ── Crear grupo ──────────────────────────

    @PostMapping
    public ResponseEntity<ApiResponse<GroupResponse>> createGroup(
            @Valid @RequestBody CreateGroupRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok("Grupo creado", groupService.createGroup(currentUserId(), request)));
    }

    // ── 2. GET /my ── Mis grupos ──────────────────────────

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<GroupResponse>>> getMyGroups() {
        return ResponseEntity.ok(ApiResponse.ok(groupService.getMyGroups(currentUserId())));
    }

    // ── 3. GET /{id} ── Detalle del grupo ─────────────────

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GroupResponse>> getGroup(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.ok(groupService.getGroupById(id, currentUserId())));
    }

    // ── 4. POST /{id}/members ── Añadir miembros ──────────

    @PostMapping("/{id}/members")
    public ResponseEntity<ApiResponse<GroupResponse>> addMembers(
            @PathVariable Long id,
            @RequestBody List<Long> memberIds) {
        return ResponseEntity.ok(
                ApiResponse.ok("Miembros añadidos",
                        groupService.addMembers(id, currentUserId(), memberIds)));
    }

    // ── 5. DELETE /{id}/members/{userId} ── Eliminar miembro

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable Long id,
            @PathVariable Long userId) {
        groupService.removeMember(id, currentUserId(), userId);
        return ResponseEntity.ok(ApiResponse.ok("Miembro eliminado", null));
    }

    // ── 6. DELETE /{id}/leave ── Salir del grupo ──────────

    @DeleteMapping("/{id}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveGroup(@PathVariable Long id) {
        groupService.leaveGroup(id, currentUserId());
        return ResponseEntity.ok(ApiResponse.ok("Has salido del grupo", null));
    }

    // ── 7. GET /{id}/messages ── Mensajes del grupo ───────

    @GetMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<Page<GroupMessageResponse>>> getGroupMessages(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(
                ApiResponse.ok(groupService.getGroupMessages(id, currentUserId(), page, size)));
    }

    // ── 8. PUT /{id}/read ── Marcar como leído ────────────

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        groupService.markGroupAsRead(id, currentUserId());
        return ResponseEntity.ok(ApiResponse.ok("Mensajes marcados como leídos", null));
    }

    // ── Helper ────────────────────────────────────────────

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
