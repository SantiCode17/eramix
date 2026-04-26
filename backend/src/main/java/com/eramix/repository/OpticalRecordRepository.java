package com.eramix.repository;

import com.eramix.entity.OpticalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OpticalRecordRepository extends JpaRepository<OpticalRecord, Long> {
    Optional<OpticalRecord> findByScanUuid(String scanUuid);
    List<OpticalRecord> findByUserIdOrderByCreatedAtDesc(Long userId);
}
