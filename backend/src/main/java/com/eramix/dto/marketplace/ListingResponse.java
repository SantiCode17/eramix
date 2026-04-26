package com.eramix.dto.marketplace;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ListingResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private String currency;
    private String condition;
    private String status;
    private Long sellerId;
    private String sellerName;
    private String sellerPhotoUrl;
    private Long categoryId;
    private String categoryName;
    private String city;
    private List<String> photoUrls;
    private String createdAt;
}
