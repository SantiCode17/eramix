package com.eramix.dto.exchange;

import lombok.*;
import java.time.Instant;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ExchangeSessionResponse {

    private Long id;
    private Long requestId;
    private Long userAId;
    private String userAFirstName;
    private String userALastName;
    private String userAProfilePhotoUrl;
    private Long userBId;
    private String userBFirstName;
    private String userBLastName;
    private String userBProfilePhotoUrl;
    private String offerLanguageName;
    private String wantLanguageName;
    private Instant scheduledAt;
    private Integer durationMinutes;
    private String status;
    private String notes;
    private Instant createdAt;
}
