package com.eramix.dto.gamification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data @Builder @AllArgsConstructor
public class AchievementResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String emoji;
    private int xpReward;
    private String category;
    private boolean unlocked;
    private String unlockedAt;
}
