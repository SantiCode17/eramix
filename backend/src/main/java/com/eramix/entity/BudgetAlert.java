package com.eramix.entity;

import com.eramix.entity.enums.BudgetAlertType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Alerta presupuestaria generada por el FinancialService.
 */
@Entity
@Table(name = "budget_alert")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BudgetAlert extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "budget_id", nullable = false)
    private Long budgetId;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false, length = 30)
    private BudgetAlertType alertType;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(name = "spent_amount", precision = 12, scale = 2)
    private BigDecimal spentAmount;

    @Column(name = "limit_amount", precision = 12, scale = 2)
    private BigDecimal limitAmount;

    @Column(name = "progress_percentage")
    private Double progressPercentage;

    @Column(name = "alert_level", length = 20)
    @Builder.Default
    private String alertLevel = "WARNING"; // WARNING (75%), CRITICAL (100%+)

    @Column(name = "projected_run_out_date")
    private LocalDate projectedRunOutDate;

    @Column(name = "is_acknowledged", nullable = false)
    @Builder.Default
    private Boolean isAcknowledged = false;
}
