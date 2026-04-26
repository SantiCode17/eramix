package com.eramix.repository;

import com.eramix.entity.QuizQuestion;
import com.eramix.entity.enums.QuizCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {

    List<QuizQuestion> findByCategory(QuizCategory category);

    List<QuizQuestion> findByCountry(String country);

    @Query("SELECT q FROM QuizQuestion q ORDER BY FUNCTION('RAND')")
    List<QuizQuestion> findRandomQuestions();

    @Query("SELECT q FROM QuizQuestion q WHERE q.category = :category ORDER BY FUNCTION('RAND')")
    List<QuizQuestion> findRandomByCategory(@Param("category") QuizCategory category);
}
