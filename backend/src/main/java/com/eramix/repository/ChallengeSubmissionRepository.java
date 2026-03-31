package com.eramix.repository;

import com.eramix.entity.ChallengeSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChallengeSubmissionRepository extends JpaRepository<ChallengeSubmission, Long> {
    List<ChallengeSubmission> findByChallengeIdOrderByVoteCountDesc(Long challengeId);
    boolean existsByChallengeIdAndUserId(Long challengeId, Long userId);
    int countByChallengeId(Long challengeId);
}
