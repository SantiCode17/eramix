package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quiz_option")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizOption extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuizQuestion question;

    @Column(name = "option_text", nullable = false, length = 300)
    private String optionText;

    @Column(name = "is_correct", nullable = false)
    private boolean isCorrect;
}
