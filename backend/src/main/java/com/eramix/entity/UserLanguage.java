package com.eramix.entity;

import com.eramix.entity.enums.ProficiencyLevel;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "user_language")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(UserLanguage.UserLanguageId.class)
public class UserLanguage {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "language_id", nullable = false)
    private Language language;

    @Enumerated(EnumType.STRING)
    @Column(name = "proficiency_level", nullable = false, length = 20)
    @Builder.Default
    private ProficiencyLevel proficiencyLevel = ProficiencyLevel.BASIC;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserLanguageId implements Serializable {
        private Long user;
        private Long language;
    }
}
