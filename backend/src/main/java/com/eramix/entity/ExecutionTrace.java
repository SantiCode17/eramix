package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Traza de ejecución de cada invocación de herramienta de un sub-agente.
 * Registra agentName, toolName, argumentos de entrada, resultado,
 * duración y estado para auditoría y debugging del sistema MAS.
 */
@Entity
@Table(name = "execution_trace")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExecutionTrace extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private AgentSession session;

    @Column(name = "agent_name", nullable = false, length = 50)
    private String agentName;

    @Column(name = "tool_name", length = 100)
    private String toolName;

    @Column(name = "input_args", columnDefinition = "JSON")
    private String inputArgs;

    @Column(name = "output_result", columnDefinition = "JSON")
    private String outputResult;

    @Column(name = "duration_ms", nullable = false)
    @Builder.Default
    private Long durationMs = 0L;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "SUCCESS";

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
}
