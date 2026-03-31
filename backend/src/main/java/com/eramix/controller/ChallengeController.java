package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.challenge.*;
import com.eramix.service.ChallengeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/challenges")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;

    private Long currentUserId() {
        return Long.parseLong(SecurityContextHolder.getContext().getAuthentication().getName());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ChallengeResponse>> create(@Valid @RequestBody CreateChallengeRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(challengeService.createChallenge(currentUserId(), req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ChallengeResponse>>> getActive() {
        return ResponseEntity.ok(ApiResponse.ok(challengeService.getActiveChallenges()));
    }

    @PostMapping("/{challengeId}/submissions")
    public ResponseEntity<ApiResponse<SubmissionResponse>> submit(
            @PathVariable Long challengeId, @RequestBody SubmitPhotoRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(challengeService.submitPhoto(currentUserId(), challengeId, req)));
    }

    @GetMapping("/{challengeId}/submissions")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getSubmissions(@PathVariable Long challengeId) {
        return ResponseEntity.ok(ApiResponse.ok(challengeService.getSubmissions(challengeId, currentUserId())));
    }

    @PostMapping("/submissions/{submissionId}/vote")
    public ResponseEntity<ApiResponse<String>> vote(@PathVariable Long submissionId) {
        challengeService.voteSubmission(currentUserId(), submissionId);
        return ResponseEntity.ok(ApiResponse.ok("Voted", "success"));
    }
}
