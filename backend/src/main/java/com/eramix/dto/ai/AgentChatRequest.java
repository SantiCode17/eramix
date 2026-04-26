package com.eramix.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentChatRequest {
    private String message;
    private String sessionUuid;
    private Double latitude;
    private Double longitude;
}
