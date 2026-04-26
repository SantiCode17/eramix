package com.eramix.dto.finance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTransactionRequest {
    private BigDecimal amount;
    private String currency;
    private String transactionType; // INCOME | EXPENSE
    private Long categoryId;
    private String description;
    private String transactionDate;
}
