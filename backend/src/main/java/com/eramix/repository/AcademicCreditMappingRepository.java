package com.eramix.repository;

import com.eramix.entity.AcademicCreditMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AcademicCreditMappingRepository extends JpaRepository<AcademicCreditMapping, Long> {
    List<AcademicCreditMapping> findByLearningAgreementId(Long learningAgreementId);
}
