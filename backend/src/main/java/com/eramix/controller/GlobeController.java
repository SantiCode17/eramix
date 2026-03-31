package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.globe.CountryStatsResponse;
import com.eramix.service.GlobeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/globe")
@RequiredArgsConstructor
public class GlobeController {

    private final GlobeService globeService;

    /**
     * GET /api/v1/globe/stats — Returns student count + universities
     * per country for the interactive 3D globe.
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<List<CountryStatsResponse>>> getCountryStats() {
        return ResponseEntity.ok(ApiResponse.ok(globeService.getCountryStats()));
    }
}
