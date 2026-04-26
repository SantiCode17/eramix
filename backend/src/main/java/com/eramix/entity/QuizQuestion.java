package com.eramix.entity;

import com.eramix.entity.enums.QuizCategory;
import com.eramix.entity.enums.QuizDifficulty;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quiz_question")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizQuestion extends BaseEntity {

    @Column(name = "question_text", nullable = false, length = 500)
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 60)
    private QuizCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QuizDifficulty difficulty;

    @Column(length = 60)
    private String country;

    @Column(length = 500)
    private String explanation;

    @Column(name = "xp_reward", nullable = false)
    private int xpReward;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<QuizOption> options = new ArrayList<>();
}
