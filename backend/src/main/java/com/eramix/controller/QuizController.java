package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.quiz.QuizQuestionResponse;
import com.eramix.dto.quiz.QuizResultResponse;
import com.eramix.dto.quiz.QuizSubmitRequest;
import com.eramix.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    // ── 1. GET /questions ── Obtener preguntas aleatorias ─

    @GetMapping("/questions")
    public ResponseEntity<ApiResponse<List<QuizQuestionResponse>>> getQuestions(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(quizService.getQuestions(category, limit)));
    }

    // ── 2. POST /submit ── Enviar respuestas ─────────────

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<QuizResultResponse>> submitQuiz(
            @Valid @RequestBody QuizSubmitRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok("Quiz completado", quizService.submitQuiz(currentUserId(), request)));
    }

    // ── Helper ────────────────────────────────────────────

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
