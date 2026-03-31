package com.eramix.dto.exchange;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ExchangeRequestDTO {

    @NotNull private Long targetUserId;
    @NotNull private Long offerLanguageId;
    @NotNull private Long wantLanguageId;
    private String message;
}
