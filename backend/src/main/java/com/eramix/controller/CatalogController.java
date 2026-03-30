package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.entity.Interest;
import com.eramix.entity.Language;
import com.eramix.entity.University;
import com.eramix.repository.InterestRepository;
import com.eramix.repository.LanguageRepository;
import com.eramix.repository.UniversityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/catalog")
@RequiredArgsConstructor
public class CatalogController {

    private final InterestRepository interestRepository;
    private final LanguageRepository languageRepository;
    private final UniversityRepository universityRepository;

    // ── 1. GET /interests ── Todos los intereses ──────────

    @GetMapping("/interests")
    public ResponseEntity<ApiResponse<List<Interest>>> getAllInterests() {
        return ResponseEntity.ok(ApiResponse.ok(interestRepository.findAll()));
    }

    // ── 2. GET /languages ── Todos los idiomas ────────────

    @GetMapping("/languages")
    public ResponseEntity<ApiResponse<List<Language>>> getAllLanguages() {
        return ResponseEntity.ok(ApiResponse.ok(languageRepository.findAll()));
    }

    // ── 3. GET /universities ── Todas las universidades ──

    @GetMapping("/universities")
    public ResponseEntity<ApiResponse<List<University>>> getAllUniversities() {
        return ResponseEntity.ok(ApiResponse.ok(universityRepository.findAll()));
    }

    // ── 4. GET /universities/search ── Buscar universidad ─

    @GetMapping("/universities/search")
    public ResponseEntity<ApiResponse<List<University>>> searchUniversities(
            @RequestParam String query) {
        return ResponseEntity.ok(
                ApiResponse.ok(universityRepository.findByNameContainingIgnoreCase(query)));
    }
}
