package com.eramix.dto.exchange;

import lombok.*;
import java.time.Instant;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ExchangeRequestResponse {

    private Long id;
    private Long requesterId;
    private String requesterFirstName;
    private String requesterLastName;
    private String requesterProfilePhotoUrl;
    private Long targetId;
    private String targetFirstName;
    private String targetLastName;
    private String targetProfilePhotoUrl;
    private Long offerLanguageId;
    private String offerLanguageName;
    private Long wantLanguageId;
    private String wantLanguageName;
    private String message;
    private String status;
    private Instant createdAt;
}
