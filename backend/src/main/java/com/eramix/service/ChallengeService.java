package com.eramix.service;

import com.eramix.dto.challenge.*;
import com.eramix.entity.*;
import com.eramix.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepo;
    private final ChallengeSubmissionRepository submissionRepo;
    private final ChallengeVoteRepository voteRepo;
    private final UserRepository userRepo;

    @Transactional
    public ChallengeResponse createChallenge(Long userId, CreateChallengeRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ErasmusChallenge c = new ErasmusChallenge();
        c.setTitle(req.getTitle());
        c.setDescription(req.getDescription());
        c.setEmoji(req.getEmoji() != null ? req.getEmoji() : "📸");
        c.setStartDate(Instant.parse(req.getStartDate()));
        c.setEndDate(Instant.parse(req.getEndDate()));
        c.setCreatedBy(user);
        c = challengeRepo.save(c);

        return mapChallenge(c, 0);
    }

    @Transactional(readOnly = true)
    public List<ChallengeResponse> getActiveChallenges() {
        return challengeRepo.findByActiveTrueOrderByEndDateDesc().stream()
                .map(c -> mapChallenge(c, submissionRepo.countByChallengeId(c.getId())))
                .toList();
    }

    @Transactional
    public SubmissionResponse submitPhoto(Long userId, Long challengeId, SubmitPhotoRequest req) {
        if (submissionRepo.existsByChallengeIdAndUserId(challengeId, userId)) {
            throw new RuntimeException("Already submitted to this challenge");
        }

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ErasmusChallenge challenge = challengeRepo.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        ChallengeSubmission sub = new ChallengeSubmission();
        sub.setChallenge(challenge);
        sub.setUser(user);
        sub.setPhotoUrl(req.getPhotoUrl());
        sub.setCaption(req.getCaption());
        sub = submissionRepo.save(sub);

        return mapSubmission(sub, false);
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getSubmissions(Long challengeId, Long currentUserId) {
        return submissionRepo.findByChallengeIdOrderByVoteCountDesc(challengeId).stream()
                .map(s -> mapSubmission(s, voteRepo.existsBySubmissionIdAndUserId(s.getId(), currentUserId)))
                .toList();
    }

    @Transactional
    public void voteSubmission(Long userId, Long submissionId) {
        if (voteRepo.existsBySubmissionIdAndUserId(submissionId, userId)) {
            throw new RuntimeException("Already voted");
        }

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ChallengeSubmission sub = submissionRepo.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        ChallengeVote vote = new ChallengeVote();
        vote.setSubmission(sub);
        vote.setUser(user);
        voteRepo.save(vote);

        sub.setVoteCount(sub.getVoteCount() + 1);
        submissionRepo.save(sub);
    }

    // ── Mappers ─────────────────────────────────────
    private ChallengeResponse mapChallenge(ErasmusChallenge c, int submissionCount) {
        return ChallengeResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .emoji(c.getEmoji())
                .startDate(c.getStartDate().toString())
                .endDate(c.getEndDate().toString())
                .active(c.isActive())
                .creatorFirstName(c.getCreatedBy().getFirstName())
                .creatorLastName(c.getCreatedBy().getLastName())
                .submissionCount(submissionCount)
                .build();
    }

    private SubmissionResponse mapSubmission(ChallengeSubmission s, boolean votedByMe) {
        return SubmissionResponse.builder()
                .id(s.getId())
                .challengeId(s.getChallenge().getId())
                .userId(s.getUser().getId())
                .userFirstName(s.getUser().getFirstName())
                .userLastName(s.getUser().getLastName())
                .userProfilePhotoUrl(s.getUser().getProfilePhotoUrl())
                .photoUrl(s.getPhotoUrl())
                .caption(s.getCaption())
                .voteCount(s.getVoteCount())
                .votedByMe(votedByMe)
                .createdAt(s.getCreatedAt().toString())
                .build();
    }
}
