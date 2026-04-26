package com.eramix.repository;

import com.eramix.entity.InterInstitutionalAgreement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InterInstitutionalAgreementRepository extends JpaRepository<InterInstitutionalAgreement, Long> {
    Optional<InterInstitutionalAgreement> findByEwpIiaId(String ewpIiaId);
}
