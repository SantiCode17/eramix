package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.ai.*;
import com.eramix.service.AiAssistantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiAssistantController {

    private final AiAssistantService aiService;

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<AiConversationResponse>>> getConversations() {
        return ResponseEntity.ok(ApiResponse.ok(aiService.getConversations(currentUserId())));
    }

    @GetMapping("/conversations/{id}")
    public ResponseEntity<ApiResponse<AiConversationResponse>> getConversation(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(aiService.getConversation(id, currentUserId())));
    }

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<AiConversationResponse>> chat(@RequestBody AiChatRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(aiService.chat(currentUserId(), req)));
    }

    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteConversation(@PathVariable Long id) {
        aiService.deleteConversation(id, currentUserId());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
