package com.eramix.dto.cityguide;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateReviewRequest {
    private Integer rating;
    private String comment;
}
