package com.eramix.dto.exchange;

import lombok.*;
import java.time.Instant;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ExchangeReviewResponse {

    private Long id;
    private Long sessionId;
    private Long reviewerId;
    private String reviewerFirstName;
    private String reviewerLastName;
    private Long revieweeId;
    private Integer rating;
    private String comment;
    private Instant createdAt;
}
