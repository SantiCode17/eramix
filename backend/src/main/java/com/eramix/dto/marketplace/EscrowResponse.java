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
public class EscrowResponse {
    private Long id;
    private Long listingId;
    private String listingTitle;
    private BigDecimal amount;
    private String currency;
    private String status;
    private Long buyerId;
    private Long sellerId;
    private String meetLocationLat;
    private String meetLocationLng;
    private String meetScheduledAt;
    private String createdAt;
}
