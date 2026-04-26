package com.eramix.repository;

import com.eramix.entity.CampusBuilding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;

public interface CampusBuildingRepository extends JpaRepository<CampusBuilding, Long> {
    List<CampusBuilding> findByUniversityId(Long universityId);

    @Query("SELECT b FROM CampusBuilding b WHERE " +
           "b.latitude BETWEEN :minLat AND :maxLat AND " +
           "b.longitude BETWEEN :minLng AND :maxLng")
    List<CampusBuilding> findInBoundingBox(BigDecimal minLat, BigDecimal maxLat,
                                            BigDecimal minLng, BigDecimal maxLng);
}
