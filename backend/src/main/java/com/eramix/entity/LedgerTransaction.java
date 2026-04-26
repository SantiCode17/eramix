package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Transacción del ledger financiero: cada gasto o ingreso registrado.
 * amountInBaseCurrency siempre en EUR para comparaciones multi-divisa.
 */
@Entity
@Table(name = "ledger_transaction")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LedgerTransaction extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "EUR";

    @Column(name = "amount_in_base_currency", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountInBaseCurrency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private SpendingCategory category;

    @Column(length = 500)
    private String description;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(name = "transaction_type", nullable = false, length = 20)
    @Builder.Default
    private String transactionType = "EXPENSE";

    @Column(name = "receipt_id")
    private Long receiptId;
}
