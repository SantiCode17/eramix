package com.eramix.entity;

import com.eramix.entity.enums.EscrowStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Transacción con depósito en garantía (escrow) para compraventa segura.
 * El dinero se bloquea en Stripe hasta confirmación de ambas partes.
 */
@Entity
@Table(name = "escrow_transaction")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EscrowTransaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private MarketplaceListing listing;

    @Column(name = "buyer_id", nullable = false)
    private Long buyerId;

    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "EUR";

    @Column(name = "stripe_payment_intent", length = 100)
    private String stripePaymentIntent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private EscrowStatus status = EscrowStatus.RESERVED;

    @Column(name = "buyer_confirmed_at")
    private Instant buyerConfirmedAt;

    @Column(name = "seller_confirmed_at")
    private Instant sellerConfirmedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "dispute_reason", columnDefinition = "TEXT")
    private String disputeReason;
}
