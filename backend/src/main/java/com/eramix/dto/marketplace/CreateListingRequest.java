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
public class CreateListingRequest {
    private String title;
    private String description;
    private BigDecimal price;
    private String currency;
    private String condition; // NEW, LIKE_NEW, GOOD, ACCEPTABLE
    private Long categoryId;
    private String city;
}
