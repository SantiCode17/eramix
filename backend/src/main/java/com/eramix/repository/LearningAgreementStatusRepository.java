package com.eramix.repository;

import com.eramix.entity.LearningAgreementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LearningAgreementStatusRepository extends JpaRepository<LearningAgreementStatus, Long> {
    List<LearningAgreementStatus> findByUserId(Long userId);
    Optional<LearningAgreementStatus> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
}
