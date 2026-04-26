package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Asignación de beca/financiación del estudiante.
 * Un usuario puede tener múltiples fuentes de financiación.
 */
@Entity
@Table(name = "grant_allocation")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GrantAllocation extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "source_name", nullable = false, length = 100)
    @Builder.Default
    private String sourceName = "Beca Erasmus+";

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "EUR";

    @Column(name = "mobility_start_date", nullable = false)
    private LocalDate mobilityStartDate;

    @Column(name = "mobility_end_date", nullable = false)
    private LocalDate mobilityEndDate;

    @Column(name = "disbursement_schedule", columnDefinition = "JSON")
    private String disbursementSchedule;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
