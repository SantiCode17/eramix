package com.eramix.repository;

import com.eramix.entity.HousingPost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HousingPostRepository extends JpaRepository<HousingPost, Long> {
    List<HousingPost> findByActiveTrueOrderByCreatedAtDesc();
    List<HousingPost> findByCityIgnoreCaseAndActiveTrueOrderByCreatedAtDesc(String city);
    List<HousingPost> findByUserIdAndActiveTrueOrderByCreatedAtDesc(Long userId);
}
