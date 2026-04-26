package com.eramix.dto.ai;

import com.eramix.entity.enums.AgentResponseType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentChatResponse {
    private String sessionUuid;
    private String text;
    private AgentResponseType responseType;
    private Map<String, Object> structuredData;
    private List<TraceItem> executionTrace;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TraceItem {
        private String agentName;
        private String toolName;
        private long durationMs;
        private boolean success;
    }
}
