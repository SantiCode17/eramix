package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

/**
 * Presupuesto de gastos configurado por el usuario.
 * Un usuario puede tener múltiples presupuestos por categoría y ciclo.
 */
@Entity
@Table(name = "budget")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Budget extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "limit_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal limitAmount;

    @Column(name = "cycle", nullable = false, length = 20)
    @Builder.Default
    private String cycle = "MONTHLY"; // DAILY, WEEKLY, MONTHLY

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "EUR";

    @Column(columnDefinition = "TEXT")
    private String notes;
}
