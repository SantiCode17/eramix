package com.eramix.repository;

import com.eramix.entity.UserLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface UserLevelRepository extends JpaRepository<UserLevel, Long> {
    Optional<UserLevel> findByUserId(Long userId);

    @Query("SELECT ul FROM UserLevel ul ORDER BY ul.totalXp DESC")
    List<UserLevel> findTopByOrderByTotalXpDesc(Pageable pageable);
}
