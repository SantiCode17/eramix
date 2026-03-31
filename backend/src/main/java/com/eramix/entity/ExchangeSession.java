package com.eramix.entity;

import com.eramix.entity.enums.ExchangeSessionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "exchange_session")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ExchangeSession extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private LanguageExchangeRequest request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_a_id", nullable = false)
    private User userA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_b_id", nullable = false)
    private User userB;

    private Instant scheduledAt;

    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ExchangeSessionStatus status = ExchangeSessionStatus.SCHEDULED;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
