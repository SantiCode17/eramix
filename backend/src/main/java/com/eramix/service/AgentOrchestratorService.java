package com.eramix.service;

import com.eramix.dto.ai.*;
import com.eramix.entity.*;
import com.eramix.entity.enums.*;
import com.eramix.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

/**
 * Multi-Agent System Orchestrator (Phase 21).
 * Routes user intents to specialized agents:
 * - FinancialAgent: budget queries, spending analytics
 * - AcademicAgent: ECTS, learning agreements, deadlines
 * - ConciergeAgent: local recommendations, events, transport
 * 
 * In production, integrate with LangChain4j + Anthropic Claude.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AgentOrchestratorService {

    private final AgentSessionRepository sessionRepo;
    private final ExecutionTraceRepository traceRepo;
    private final FinancialService financialService;
    private final WellbeingService wellbeingService;
    private final ObjectMapper objectMapper;

    @Transactional
    public AgentChatResponse chat(Long userId, AgentChatRequest req) {
        long startMs = System.currentTimeMillis();

        // Resolve or create session
        AgentSession session;
        if (req.getSessionUuid() != null) {
            session = sessionRepo.findBySessionUuid(req.getSessionUuid())
                    .orElseThrow(() -> new RuntimeException("Session not found"));
        } else {
            session = AgentSession.builder()
                    .sessionUuid(UUID.randomUUID().toString())
                    .userId(userId)
                    .build();
            session = sessionRepo.save(session);
        }

        // Classify intent
        AgentIntentType intent = classifyIntent(req.getMessage());
        List<AgentChatResponse.TraceItem> traces = new ArrayList<>();

        String responseText;
        AgentResponseType responseType = AgentResponseType.TEXT;
        Map<String, Object> structured = null;

        switch (intent) {
            case FINANCIAL -> {
                long t = System.currentTimeMillis();
                var summary = financialService.getSummary(userId);
                traces.add(trace("FinancialAgent", "getSummary", System.currentTimeMillis() - t, true));
                responseText = buildFinancialResponse(summary);
                responseType = AgentResponseType.FINANCIAL_SUMMARY;
                structured = Map.of("summary", summary);
            }
            case ACADEMIC -> {
                long t = System.currentTimeMillis();
                responseText = "📚 I can help with your academic situation. Your learning agreement status, ECTS credits, and deadlines are tracked in the Academic section. Would you like to check your current agreement status or credit mappings?";
                traces.add(trace("AcademicAgent", "getStatus", System.currentTimeMillis() - t, true));
            }
            case CONCIERGE -> {
                long t = System.currentTimeMillis();
                responseText = buildConciergeResponse(req);
                traces.add(trace("ConciergeAgent", "recommend", System.currentTimeMillis() - t, true));
            }
            default -> {
                responseText = buildGeneralResponse(req.getMessage());
            }
        }

        // Log execution trace
        String inputJson;
        String outputJson;
        try {
            inputJson = objectMapper.writeValueAsString(Map.of("message", req.getMessage()));
            String outText = responseText.length() > 500 ? responseText.substring(0, 500) : responseText;
            outputJson = objectMapper.writeValueAsString(Map.of("text", outText));
        } catch (JsonProcessingException e) {
            inputJson = "{}";
            outputJson = "{}";
        }

        ExecutionTrace traceEntity = ExecutionTrace.builder()
                .session(session)
                .agentName(intent.name())
                .toolName("chat")
                .inputArgs(inputJson)
                .outputResult(outputJson)
                .durationMs((long) (System.currentTimeMillis() - startMs))
                .status("SUCCESS")
                .build();
        traceRepo.save(traceEntity);

        return AgentChatResponse.builder()
                .sessionUuid(session.getSessionUuid())
                .text(responseText)
                .responseType(responseType)
                .structuredData(structured)
                .executionTrace(traces)
                .build();
    }

    // ── Intent Classification ────────────────────────────────────────────

    private AgentIntentType classifyIntent(String message) {
        String lower = message.toLowerCase();

        // Financial keywords
        if (containsAny(lower, "budget", "money", "spend", "cost", "expense", "grant",
                "financial", "euro", "presupuesto", "dinero", "gasto")) {
            return AgentIntentType.FINANCIAL;
        }

        // Academic keywords
        if (containsAny(lower, "ects", "credit", "course", "exam", "grade", "learning agreement",
                "university", "academic", "profesor", "asignatura", "crédito")) {
            return AgentIntentType.ACADEMIC;
        }

        // Concierge keywords
        if (containsAny(lower, "restaurant", "bar", "cafe", "museum", "transport", "bus",
                "metro", "near", "recommend", "where", "place", "restaurante", "cerca")) {
            return AgentIntentType.CONCIERGE;
        }

        return AgentIntentType.GENERAL;
    }

    private boolean containsAny(String text, String... keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) return true;
        }
        return false;
    }

    // ── Response builders ────────────────────────────────────────────────

    private String buildFinancialResponse(com.eramix.dto.finance.FinancialSummaryResponse summary) {
        StringBuilder sb = new StringBuilder();
        sb.append("💰 **Financial Overview**\n\n");
        sb.append("• Total Budget: ").append(summary.getTotalBudget()).append("€\n");
        sb.append("• Spent: ").append(summary.getTotalSpent()).append("€\n");
        sb.append("• Remaining: ").append(summary.getRemaining()).append("€\n");
        sb.append("• Daily burn rate: ").append(summary.getBurnRatePerDay()).append("€/day\n");
        sb.append("• Estimated days left: ").append(summary.getEstimatedDaysLeft()).append("\n\n");

        if (summary.getAlerts() != null && !summary.getAlerts().isEmpty()) {
            sb.append("⚠️ **Alerts:**\n");
            for (var alert : summary.getAlerts()) {
                sb.append("• ").append(alert.getMessage()).append("\n");
            }
        }
        return sb.toString();
    }

    private String buildConciergeResponse(AgentChatRequest req) {
        StringBuilder sb = new StringBuilder();
        sb.append("🗺️ **Local Recommendations**\n\n");
        if (req.getLatitude() != null && req.getLongitude() != null) {
            sb.append("Based on your location (").append(String.format("%.4f", req.getLatitude()))
              .append(", ").append(String.format("%.4f", req.getLongitude())).append("):\n\n");
        }
        sb.append("I can help you find restaurants, museums, transport options, and more in your area. ");
        sb.append("Check the City Guide section for detailed recommendations, or ask me about specific places!");
        return sb.toString();
    }

    private String buildGeneralResponse(String message) {
        return "👋 I'm your ERAMIX AI assistant! I can help with:\n\n" +
               "💰 **Financial** – Budget tracking, spending analysis, grant info\n" +
               "📚 **Academic** – ECTS credits, learning agreements, deadlines\n" +
               "🗺️ **Concierge** – Local recommendations, transport, events\n\n" +
               "What would you like help with?";
    }

    private AgentChatResponse.TraceItem trace(String agent, String tool, long ms, boolean success) {
        return AgentChatResponse.TraceItem.builder()
                .agentName(agent)
                .toolName(tool)
                .durationMs(ms)
                .success(success)
                .build();
    }
}
