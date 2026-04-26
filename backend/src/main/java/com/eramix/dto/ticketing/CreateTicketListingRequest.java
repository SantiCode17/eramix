package com.eramix.dto.ticketing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTicketListingRequest {
    private Long eventId;
    private BigDecimal price;
    private String currency;
    private Integer maxCapacity;
    private String saleStartsAt;
    private String saleEndsAt;
}
