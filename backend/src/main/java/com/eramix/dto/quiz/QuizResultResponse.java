package com.eramix.dto.quiz;

import lombok.*;

import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class QuizResultResponse {
    private int score;
    private int totalQuestions;
    private double percentage;
    private int xpEarned;
    private List<QuestionResult> details;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class QuestionResult {
        private Long questionId;
        private String questionText;
        private boolean correct;
        private String correctAnswer;
        private String selectedAnswer;
        private String explanation;
    }
}
