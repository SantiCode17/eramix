package com.eramix.service;

import com.eramix.dto.quiz.*;
import com.eramix.dto.quiz.QuizQuestionResponse.QuizOptionResponse;
import com.eramix.dto.quiz.QuizResultResponse.QuestionResult;
import com.eramix.entity.*;
import com.eramix.entity.enums.QuizCategory;
import com.eramix.entity.enums.XpSourceType;
import com.eramix.repository.QuizQuestionRepository;
import com.eramix.repository.QuizResultRepository;
import com.eramix.repository.UserRepository;
import com.eramix.exception.UserNotFoundException;
import io.micrometer.core.instrument.Counter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuizService {

    private final QuizQuestionRepository questionRepository;
    private final QuizResultRepository resultRepository;
    private final UserRepository userRepository;
    private final GamificationService gamificationService;
    private final Counter quizCompletedCounter;

    private static final int DEFAULT_QUIZ_SIZE = 10;

    // ── Obtener preguntas aleatorias ──────────────────────

    @Transactional(readOnly = true)
    public List<QuizQuestionResponse> getQuestions(String category, int limit) {
        List<QuizQuestion> questions;

        if (category != null && !category.isBlank()) {
            try {
                QuizCategory cat = QuizCategory.valueOf(category.toUpperCase());
                questions = questionRepository.findRandomByCategory(cat);
            } catch (IllegalArgumentException e) {
                questions = questionRepository.findRandomQuestions();
            }
        } else {
            questions = questionRepository.findRandomQuestions();
        }

        int effectiveLimit = limit > 0 ? limit : DEFAULT_QUIZ_SIZE;

        return questions.stream()
                .limit(effectiveLimit)
                .map(this::toQuestionResponse)
                .toList();
    }

    // ── Enviar respuestas y evaluar ───────────────────────

    @Transactional
    public QuizResultResponse submitQuiz(Long userId, QuizSubmitRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // Pre-cargar todas las preguntas referenciadas
        List<Long> questionIds = request.getAnswers().stream()
                .map(QuizSubmitRequest.QuizAnswer::getQuestionId)
                .toList();

        Map<Long, QuizQuestion> questionMap = questionRepository.findAllById(questionIds).stream()
                .collect(Collectors.toMap(BaseEntity::getId, q -> q));

        int score = 0;
        int totalXp = 0;
        List<QuestionResult> details = new ArrayList<>();

        for (QuizSubmitRequest.QuizAnswer answer : request.getAnswers()) {
            QuizQuestion question = questionMap.get(answer.getQuestionId());
            if (question == null) continue;

            // Encontrar la opción correcta
            QuizOption correctOption = question.getOptions().stream()
                    .filter(QuizOption::isCorrect)
                    .findFirst()
                    .orElse(null);

            // Encontrar la opción seleccionada
            QuizOption selectedOption = question.getOptions().stream()
                    .filter(o -> o.getId().equals(answer.getSelectedOptionId()))
                    .findFirst()
                    .orElse(null);

            boolean isCorrect = correctOption != null && selectedOption != null
                    && correctOption.getId().equals(selectedOption.getId());

            if (isCorrect) {
                score++;
                totalXp += question.getXpReward();
            }

            details.add(QuestionResult.builder()
                    .questionId(question.getId())
                    .questionText(question.getQuestionText())
                    .correct(isCorrect)
                    .correctAnswer(correctOption != null ? correctOption.getOptionText() : "N/A")
                    .selectedAnswer(selectedOption != null ? selectedOption.getOptionText() : "N/A")
                    .explanation(question.getExplanation())
                    .build());
        }

        // Guardar resultado
        QuizResult result = QuizResult.builder()
                .user(user)
                .score(score)
                .totalQuestions(details.size())
                .xpEarned(totalXp)
                .completedAt(Instant.now())
                .build();
        resultRepository.save(result);
        quizCompletedCounter.increment();

        // Otorgar XP
        if (totalXp > 0) {
            gamificationService.awardXp(userId, totalXp, "Quiz cultural completado", XpSourceType.SYSTEM);
        }

        log.info("Quiz completado: userId={}, score={}/{}, xp={}", userId, score, details.size(), totalXp);

        return QuizResultResponse.builder()
                .score(score)
                .totalQuestions(details.size())
                .percentage(details.isEmpty() ? 0 : (double) score / details.size() * 100)
                .xpEarned(totalXp)
                .details(details)
                .build();
    }

    // ── Historial del usuario ─────────────────────────────

    @Transactional(readOnly = true)
    public List<QuizResult> getUserHistory(Long userId) {
        return resultRepository.findByUserIdOrderByCompletedAtDesc(userId);
    }

    // ── Mapper ────────────────────────────────────────────

    private QuizQuestionResponse toQuestionResponse(QuizQuestion q) {
        return QuizQuestionResponse.builder()
                .id(q.getId())
                .questionText(q.getQuestionText())
                .category(q.getCategory().name())
                .difficulty(q.getDifficulty().name())
                .country(q.getCountry())
                .xpReward(q.getXpReward())
                .options(q.getOptions().stream()
                        .map(o -> QuizOptionResponse.builder()
                                .id(o.getId())
                                .optionText(o.getOptionText())
                                .build())
                        .toList())
                .build();
    }
}
