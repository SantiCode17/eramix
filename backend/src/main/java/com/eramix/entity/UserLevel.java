package com.eramix.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_level")
@Getter @Setter @NoArgsConstructor
public class UserLevel extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private int level = 1;

    @Column(name = "current_xp", nullable = false)
    private int currentXp = 0;

    @Column(name = "total_xp", nullable = false)
    private int totalXp = 0;
}
