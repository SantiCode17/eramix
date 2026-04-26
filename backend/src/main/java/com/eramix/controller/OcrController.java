package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.ocr.*;
import com.eramix.service.OcrService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ocr")
@RequiredArgsConstructor
public class OcrController {

    private final OcrService ocrService;

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @PostMapping("/scan")
    public ResponseEntity<ApiResponse<OcrScanResponse>> scan(@RequestBody OcrScanRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                ocrService.processImage(currentUserId(), req)));
    }

    @GetMapping("/scans")
    public ResponseEntity<ApiResponse<List<OcrScanResponse>>> getScans() {
        return ResponseEntity.ok(ApiResponse.ok(
                ocrService.getUserScans(currentUserId())));
    }
}
