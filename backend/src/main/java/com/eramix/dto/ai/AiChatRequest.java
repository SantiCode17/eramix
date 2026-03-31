package com.eramix.dto.ai;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiChatRequest {
    private Long conversationId; // null = new conversation
    private String message;
}
