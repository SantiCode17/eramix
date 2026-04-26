package com.eramix.dto.quiz;

import lombok.*;

import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class QuizQuestionResponse {
    private Long id;
    private String questionText;
    private String category;
    private String difficulty;
    private String country;
    private int xpReward;
    private List<QuizOptionResponse> options;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class QuizOptionResponse {
        private Long id;
        private String optionText;
    }
}
