package com.eramix.entity;

import com.eramix.entity.enums.AchievementCategory;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "achievement")
@Getter @Setter @NoArgsConstructor
public class Achievement extends BaseEntity {

    @Column(nullable = false, unique = true, length = 60)
    private String code;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false, length = 10)
    private String emoji;

    @Column(name = "xp_reward", nullable = false)
    private int xpReward;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private AchievementCategory category = AchievementCategory.GENERAL;
}
