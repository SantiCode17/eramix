package com.eramix.dto.cityguide;

import lombok.*;
import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReviewResponse {
    private Long id;
    private Long placeId;
    private Long userId;
    private Integer rating;
    private String comment;
    private Instant createdAt;
}
