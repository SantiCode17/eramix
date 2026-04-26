package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.ai.*;
import com.eramix.service.AgentOrchestratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/agent")
@RequiredArgsConstructor
public class AgentController {

    private final AgentOrchestratorService agentService;

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<AgentChatResponse>> chat(@RequestBody AgentChatRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                agentService.chat(currentUserId(), req)));
    }
}
