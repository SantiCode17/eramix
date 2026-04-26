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
public class TransactionResponse {
    private Long id;
    private BigDecimal amount;
    private String currency;
    private BigDecimal amountInBaseCurrency;
    private String transactionType;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private String description;
    private String transactionDate;
    private String createdAt;
}
