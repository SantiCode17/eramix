package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

/**
 * Configuración de venta de entradas para un evento.
 * @Version para control de concurrencia optimista.
 */
@Entity
@Table(name = "ticket_listing")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketListing extends BaseEntity {

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "EUR";

    @Column(name = "total_tickets", nullable = false)
    private Integer totalTickets;

    @Column(name = "remaining_tickets", nullable = false)
    private Integer remainingTickets;

    @Column(name = "sales_start")
    private java.time.Instant salesStart;

    @Column(name = "sales_end")
    private java.time.Instant salesEnd;

    @Column(name = "max_per_user", nullable = false)
    @Builder.Default
    private Integer maxPerUser = 4;

    @Version
    @Column(nullable = false)
    private Integer version;
}
