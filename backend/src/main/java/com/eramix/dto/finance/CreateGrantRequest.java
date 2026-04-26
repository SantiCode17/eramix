package com.eramix.dto.finance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateGrantRequest {
    private String sourceName;
    private BigDecimal totalAmount;
    private BigDecimal disbursedAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;
}
