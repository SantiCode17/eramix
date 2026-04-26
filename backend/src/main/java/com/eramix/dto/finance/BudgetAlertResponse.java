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
public class BudgetAlertResponse {
    private Long id;
    private Long budgetId;
    private String categoryName;
    private String message;
    private BigDecimal spent;
    private BigDecimal limit;
    private Double progress;
    private String alertLevel; // WARNING (75%), CRITICAL (100%+)
    private Boolean isAcknowledged;
    private String createdAt;
}
