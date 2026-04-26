package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Check-in diario de estado de ánimo del estudiante (1-5).
 * Datos mínimos para maximizar la tasa de respuesta.
 */
@Entity
@Table(name = "wellbeing_checkin")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WellbeingCheckin extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "mood_score", nullable = false, columnDefinition = "tinyint")
    private Integer moodScore;
}
