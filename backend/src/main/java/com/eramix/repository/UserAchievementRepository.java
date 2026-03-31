package com.eramix.repository;

import com.eramix.entity.UserAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {
    List<UserAchievement> findByUserId(Long userId);
    boolean existsByUserIdAndAchievementId(Long userId, Long achievementId);
    boolean existsByUserIdAndAchievementCode(Long userId, String code);
    long countByUserId(Long userId);
}
