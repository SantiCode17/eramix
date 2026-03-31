package com.eramix.repository;

import com.eramix.entity.ErasmusChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChallengeRepository extends JpaRepository<ErasmusChallenge, Long> {
    List<ErasmusChallenge> findByActiveTrueOrderByEndDateDesc();
}
