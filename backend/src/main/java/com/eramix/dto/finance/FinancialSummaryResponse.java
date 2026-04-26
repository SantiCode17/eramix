package com.eramix.dto.finance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialSummaryResponse {
    private BigDecimal totalBudget;
    private BigDecimal totalSpent;
    private BigDecimal remaining;
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal balance;
    private BigDecimal burnRatePerDay;
    private Integer estimatedDaysLeft;
    private String baseCurrency;
    private Map<String, BigDecimal> spendingByCategory;
    private List<AlertItem> alerts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlertItem {
        private Long id;
        private String alertType;
        private String message;
        private boolean acknowledged;
        private String createdAt;
    }
}
