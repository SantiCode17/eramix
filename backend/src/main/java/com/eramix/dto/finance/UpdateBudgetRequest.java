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
public class UpdateBudgetRequest {
    private Long categoryId;
    private BigDecimal limitAmount;
    private String cycle; // DAILY, WEEKLY, MONTHLY
    private String notes;
}
