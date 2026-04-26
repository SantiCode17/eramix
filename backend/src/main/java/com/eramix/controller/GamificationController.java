package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.gamification.AchievementResponse;
import com.eramix.dto.gamification.LeaderboardEntry;
import com.eramix.dto.gamification.UserProgressResponse;
import com.eramix.service.GamificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService gamificationService;

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @GetMapping("/progress")
    public ResponseEntity<ApiResponse<UserProgressResponse>> getProgress() {
        return ResponseEntity.ok(ApiResponse.ok(gamificationService.getUserProgress(currentUserId())));
    }

    @GetMapping("/achievements")
    public ResponseEntity<ApiResponse<List<AchievementResponse>>> getAchievements() {
        return ResponseEntity.ok(ApiResponse.ok(gamificationService.getAllAchievements(currentUserId())));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<LeaderboardEntry>>> getLeaderboard(
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(gamificationService.getLeaderboard(limit)));
    }
}
