package com.eramix.dto.ai;

import lombok.*;
import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiMessageResponse {
    private Long id;
    private String role;
    private String content;
    private Instant createdAt;
}
