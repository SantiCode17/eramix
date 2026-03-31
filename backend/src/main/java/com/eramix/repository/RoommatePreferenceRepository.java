package com.eramix.repository;

import com.eramix.entity.RoommatePreference;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoommatePreferenceRepository extends JpaRepository<RoommatePreference, Long> {
    Optional<RoommatePreference> findByUserId(Long userId);
}
