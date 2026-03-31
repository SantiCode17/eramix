package com.eramix.dto.gamification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data @Builder @AllArgsConstructor
public class LeaderboardEntry {
    private Long userId;
    private String firstName;
    private String lastName;
    private String profilePhotoUrl;
    private int level;
    private int totalXp;
    private int rank;
}
