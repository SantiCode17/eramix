package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Caché de tipos de cambio obtenidos de open.er-api.com.
 */
@Entity
@Table(name = "exchange_rate_cache")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExchangeRateCache extends BaseEntity {

    @Column(name = "base_currency", nullable = false, length = 3)
    private String baseCurrency;

    @Column(name = "target_currency", nullable = false, length = 3)
    private String targetCurrency;

    @Column(nullable = false, precision = 16, scale = 8)
    private BigDecimal rate;

    @Column(name = "fetched_at", nullable = false)
    private Instant fetchedAt;
}
