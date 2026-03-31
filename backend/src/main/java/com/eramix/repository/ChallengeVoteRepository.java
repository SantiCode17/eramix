package com.eramix.repository;

import com.eramix.entity.ChallengeVote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChallengeVoteRepository extends JpaRepository<ChallengeVote, Long> {
    boolean existsBySubmissionIdAndUserId(Long submissionId, Long userId);
}
