package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

/**
 * Entrada criptográfica con TOTP para validación segura.
 * El secreto TOTP se almacena cifrado; el QR se regenera cada 30s.
 */
@Entity
@Table(name = "cryptographic_ticket")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CryptographicTicket extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_listing_id", nullable = false)
    private TicketListing ticketListing;

    @Column(name = "buyer_id", nullable = false)
    private Long buyerId;

    @Column(name = "ticket_uuid", nullable = false, unique = true, length = 36)
    private String ticketUuid;

    @Column(name = "totp_secret_hash", nullable = false, length = 255)
    private String totpSecretHash;

    @Column(name = "totp_secret_encrypted", nullable = false, length = 512)
    private String totpSecretEncrypted;

    @Column(name = "stripe_payment_intent", length = 100)
    private String stripePaymentIntent;

    @Column(name = "is_redeemed", nullable = false)
    @Builder.Default
    private Boolean isRedeemed = false;

    @Column(name = "redeemed_at")
    private Instant redeemedAt;

    @Column(name = "purchase_date", nullable = false)
    private Instant purchaseDate;
}
