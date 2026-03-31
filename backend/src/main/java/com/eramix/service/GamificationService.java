package com.eramix.service;

import com.eramix.dto.gamification.AchievementResponse;
import com.eramix.dto.gamification.LeaderboardEntry;
import com.eramix.dto.gamification.UserProgressResponse;
import com.eramix.entity.*;
import com.eramix.entity.enums.XpSourceType;
import com.eramix.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GamificationService {

    private final AchievementRepository achievementRepo;
    private final UserAchievementRepository userAchievementRepo;
    private final UserLevelRepository userLevelRepo;
    private final XpTransactionRepository xpTransactionRepo;
    private final UserRepository userRepo;

    // ── XP thresholds per level ─────────────────────
    private static final int[] XP_PER_LEVEL = {
        0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000, 5000, // 0-10
        6200, 7500, 9000, 10800, 12800, 15000, 17500, 20500, 24000, 28000 // 11-20
    };

    private int xpForLevel(int level) {
        if (level < 0) return 0;
        if (level >= XP_PER_LEVEL.length) return XP_PER_LEVEL[XP_PER_LEVEL.length - 1] + (level - XP_PER_LEVEL.length + 1) * 5000;
        return XP_PER_LEVEL[level];
    }

    // ── Award XP ────────────────────────────────────
    @Transactional
    public UserLevel awardXp(Long userId, int amount, String reason, XpSourceType sourceType) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserLevel ul = userLevelRepo.findByUserId(userId).orElseGet(() -> {
            UserLevel newUl = new UserLevel();
            newUl.setUser(user);
            return userLevelRepo.save(newUl);
        });

        ul.setCurrentXp(ul.getCurrentXp() + amount);
        ul.setTotalXp(ul.getTotalXp() + amount);

        // Level up check
        while (ul.getCurrentXp() >= xpForLevel(ul.getLevel())) {
            ul.setCurrentXp(ul.getCurrentXp() - xpForLevel(ul.getLevel()));
            ul.setLevel(ul.getLevel() + 1);
        }

        userLevelRepo.save(ul);

        XpTransaction tx = new XpTransaction();
        tx.setUser(user);
        tx.setAmount(amount);
        tx.setReason(reason);
        tx.setSourceType(sourceType);
        xpTransactionRepo.save(tx);

        return ul;
    }

    // ── Unlock achievement ──────────────────────────
    @Transactional
    public boolean unlockAchievement(Long userId, String achievementCode) {
        if (userAchievementRepo.existsByUserIdAndAchievementCode(userId, achievementCode)) {
            return false;
        }

        Achievement achievement = achievementRepo.findByCode(achievementCode)
                .orElseThrow(() -> new RuntimeException("Achievement not found: " + achievementCode));

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserAchievement ua = new UserAchievement();
        ua.setUser(user);
        ua.setAchievement(achievement);
        ua.setUnlockedAt(Instant.now());
        userAchievementRepo.save(ua);

        if (achievement.getXpReward() > 0) {
            awardXp(userId, achievement.getXpReward(), "Achievement: " + achievement.getName(), XpSourceType.ACHIEVEMENT);
        }

        return true;
    }

    // ── Get user progress ───────────────────────────
    @Transactional(readOnly = true)
    public UserProgressResponse getUserProgress(Long userId) {
        UserLevel ul = userLevelRepo.findByUserId(userId).orElseGet(() -> {
            UserLevel newUl = new UserLevel();
            newUl.setLevel(1);
            newUl.setCurrentXp(0);
            newUl.setTotalXp(0);
            return newUl;
        });

        int xpNeeded = xpForLevel(ul.getLevel());
        double progress = xpNeeded > 0 ? (double) ul.getCurrentXp() / xpNeeded * 100.0 : 0;
        long unlockedCount = userAchievementRepo.countByUserId(userId);
        long totalCount = achievementRepo.count();

        return UserProgressResponse.builder()
                .level(ul.getLevel())
                .currentXp(ul.getCurrentXp())
                .totalXp(ul.getTotalXp())
                .xpToNextLevel(xpNeeded - ul.getCurrentXp())
                .progressPercent(Math.round(progress * 100.0) / 100.0)
                .achievementsUnlocked((int) unlockedCount)
                .totalAchievements((int) totalCount)
                .build();
    }

    // ── Get all achievements with unlock status ─────
    @Transactional(readOnly = true)
    public List<AchievementResponse> getAllAchievements(Long userId) {
        List<Achievement> all = achievementRepo.findAll();
        List<UserAchievement> unlocked = userAchievementRepo.findByUserId(userId);

        var unlockedMap = unlocked.stream()
                .collect(Collectors.toMap(
                        ua -> ua.getAchievement().getId(),
                        ua -> ua.getUnlockedAt()
                ));

        return all.stream().map(a -> AchievementResponse.builder()
                .id(a.getId())
                .code(a.getCode())
                .name(a.getName())
                .description(a.getDescription())
                .emoji(a.getEmoji())
                .xpReward(a.getXpReward())
                .category(a.getCategory().name())
                .unlocked(unlockedMap.containsKey(a.getId()))
                .unlockedAt(unlockedMap.containsKey(a.getId()) ? unlockedMap.get(a.getId()).toString() : null)
                .build()
        ).toList();
    }

    // ── Leaderboard ─────────────────────────────────
    @Transactional(readOnly = true)
    public List<LeaderboardEntry> getLeaderboard(int limit) {
        List<UserLevel> top = userLevelRepo.findTopByOrderByTotalXpDesc(PageRequest.of(0, limit));
        AtomicInteger rank = new AtomicInteger(1);

        return top.stream().map(ul -> {
            User u = ul.getUser();
            return LeaderboardEntry.builder()
                    .userId(u.getId())
                    .firstName(u.getFirstName())
                    .lastName(u.getLastName())
                    .profilePhotoUrl(u.getProfilePhotoUrl())
                    .level(ul.getLevel())
                    .totalXp(ul.getTotalXp())
                    .rank(rank.getAndIncrement())
                    .build();
        }).toList();
    }
}
