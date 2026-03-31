package com.eramix.entity;

import com.eramix.entity.enums.ExchangeRequestStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "language_exchange_request")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class LanguageExchangeRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_id", nullable = false)
    private User target;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_language_id", nullable = false)
    private Language offerLanguage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "want_language_id", nullable = false)
    private Language wantLanguage;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ExchangeRequestStatus status = ExchangeRequestStatus.PENDING;
}
