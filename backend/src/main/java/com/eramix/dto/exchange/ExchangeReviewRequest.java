package com.eramix.dto.exchange;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ExchangeReviewRequest {

    @NotNull private Long sessionId;
    @NotNull @Min(1) @Max(5) private Integer rating;
    private String comment;
}
