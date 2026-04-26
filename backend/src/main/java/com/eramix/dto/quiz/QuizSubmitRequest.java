package com.eramix.dto.quiz;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class QuizSubmitRequest {

    @NotNull
    @Size(min = 1, message = "Debe responder al menos 1 pregunta")
    private List<QuizAnswer> answers;

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class QuizAnswer {
        @NotNull
        private Long questionId;
        @NotNull
        private Long selectedOptionId;
    }
}
