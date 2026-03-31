package com.eramix.dto.gamification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data @Builder @AllArgsConstructor
public class UserProgressResponse {
    private int level;
    private int currentXp;
    private int totalXp;
    private int xpToNextLevel;
    private double progressPercent;
    private int achievementsUnlocked;
    private int totalAchievements;
}
