package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "quiz_result")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizResult extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private int score;

    @Column(name = "total_questions", nullable = false)
    private int totalQuestions;

    @Column(name = "xp_earned", nullable = false)
    private int xpEarned;

    @Column(name = "completed_at", nullable = false)
    private Instant completedAt;
}
