package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
public class MediaController {

    private final FileStorageService fileStorageService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> uploadMedia(
            @RequestParam("file") MultipartFile file) {
        String mediaUrl = fileStorageService.storePhoto(file);
        return ResponseEntity.ok(ApiResponse.ok("File uploaded successfully", mediaUrl));
    }
}
