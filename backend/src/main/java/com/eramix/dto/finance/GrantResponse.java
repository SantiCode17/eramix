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
public class GrantResponse {
    private Long id;
    private String sourceName;
    private BigDecimal totalAmount;
    private BigDecimal disbursedAmount;
    private String currency;
    private String mobilityStartDate;
    private String mobilityEndDate;
    private String createdAt;
}
