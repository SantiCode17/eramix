package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.gdpr.*;
import com.eramix.service.GdprService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/privacy")
@RequiredArgsConstructor
public class GdprController {

    private final GdprService gdprService;

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @GetMapping("/consents")
    public ResponseEntity<ApiResponse<ConsentStatusResponse>> getConsents() {
        return ResponseEntity.ok(ApiResponse.ok(
                gdprService.getConsentStatus(currentUserId())));
    }

    @PutMapping("/consents")
    public ResponseEntity<ApiResponse<ConsentStatusResponse>> updateConsents(
            @RequestBody ConsentUpdateRequest req, HttpServletRequest httpReq) {
        String ip = httpReq.getRemoteAddr();
        return ResponseEntity.ok(ApiResponse.ok(
                gdprService.updateConsents(currentUserId(), req, ip)));
    }

    @PostMapping("/data-export")
    public ResponseEntity<ApiResponse<DataExportResponse>> requestDataExport() {
        return ResponseEntity.ok(ApiResponse.ok(
                gdprService.requestDataExport(currentUserId())));
    }

    @DeleteMapping("/account")
    public ResponseEntity<ApiResponse<Void>> requestAccountDeletion(HttpServletRequest httpReq) {
        gdprService.requestAccountDeletion(currentUserId(), httpReq.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.ok("Account deletion scheduled. 30-day grace period started.", null));
    }
}
