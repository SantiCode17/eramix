package com.eramix.dto.ai;

import lombok.*;
import java.time.Instant;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiConversationResponse {
    private Long id;
    private String title;
    private List<AiMessageResponse> messages;
    private Instant createdAt;
}
