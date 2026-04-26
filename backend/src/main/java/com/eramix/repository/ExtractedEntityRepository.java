package com.eramix.repository;

import com.eramix.entity.ExtractedEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExtractedEntityRepository extends JpaRepository<ExtractedEntity, Long> {
    List<ExtractedEntity> findByOpticalRecordId(Long opticalRecordId);
}
