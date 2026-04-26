-- =============================================================================
-- V12: Fase 21 — Tablas del sistema multi-agente con IA
-- Sesiones de agente, trazas de ejecución y documentos vectoriales
-- =============================================================================

CREATE TABLE agent_session (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_uuid    VARCHAR(36) NOT NULL UNIQUE,
    user_id         BIGINT NOT NULL,
    conversation_id BIGINT,
    intent_type     VARCHAR(30) NOT NULL DEFAULT 'GENERAL',
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (conversation_id) REFERENCES ai_conversation(id) ON DELETE SET NULL,
    INDEX idx_agent_session_user (user_id),
    INDEX idx_agent_session_uuid (session_uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE execution_trace (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id      BIGINT NOT NULL,
    agent_name      VARCHAR(50) NOT NULL,
    tool_name       VARCHAR(100),
    input_args      JSON,
    output_result   JSON,
    duration_ms     BIGINT NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    error_message   TEXT,
    created_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (session_id) REFERENCES agent_session(id) ON DELETE CASCADE,
    INDEX idx_execution_trace_session (session_id),
    INDEX idx_execution_trace_agent (agent_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE vector_document (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    source_url      VARCHAR(512),
    document_type   VARCHAR(50) NOT NULL DEFAULT 'FAQ',
    language_code   VARCHAR(10) NOT NULL DEFAULT 'en',
    chunk_count     INT NOT NULL DEFAULT 0,
    file_hash       VARCHAR(64),
    ingested_at     DATETIME(6),
    created_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_vector_doc_type (document_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
