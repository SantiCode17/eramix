package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

/**
 * Registro de canje de una entrada en el punto de acceso del evento.
 */
@Entity
@Table(name = "ticket_redemption")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketRedemption extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false, unique = true)
    private CryptographicTicket ticket;

    @Column(name = "scanner_user_id")
    private Long scannerUserId;

    @Column(name = "device_info", length = 255)
    private String deviceInfo;

    @Column(name = "scanned_at", nullable = false)
    private Instant scannedAt;
}
