package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Sesión del orquestador multi-agente.
 * Cada conversación con el MAS genera una sesión con UUID único
 * para trazabilidad y auditoría de las decisiones del LLM.
 */
@Entity
@Table(name = "agent_session")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AgentSession extends BaseEntity {

    @Column(name = "session_uuid", nullable = false, unique = true, length = 36)
    private String sessionUuid;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "conversation_id")
    private Long conversationId;

    @Column(name = "intent_type", nullable = false, length = 30)
    @Builder.Default
    private String intentType = "GENERAL";

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";
}
