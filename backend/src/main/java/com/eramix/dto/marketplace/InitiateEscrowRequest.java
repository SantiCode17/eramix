package com.eramix.dto.marketplace;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InitiateEscrowRequest {
    private Long listingId;
    private BigDecimal meetLatitude;
    private BigDecimal meetLongitude;
    private String meetScheduledAt;
}
