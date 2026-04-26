-- =============================================================================
-- V20: Fase 30 — Tablas de GDPR, consentimientos y auditoría
-- =============================================================================

CREATE TABLE consent_audit_log (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    consent_type    VARCHAR(50) NOT NULL,
    granted         BOOLEAN NOT NULL,
    ip_address      VARCHAR(255),
    user_agent      VARCHAR(512),
    created_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_consent_user (user_id),
    INDEX idx_consent_type (consent_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de preferencias de consentimiento activo del usuario
CREATE TABLE user_consent (
    id                          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id                     BIGINT NOT NULL UNIQUE,
    location_tracking           BOOLEAN NOT NULL DEFAULT FALSE,
    wellbeing_analysis          BOOLEAN NOT NULL DEFAULT FALSE,
    marketing_notifications     BOOLEAN NOT NULL DEFAULT FALSE,
    analytics_anonymized        BOOLEAN NOT NULL DEFAULT TRUE,
    third_party_ewp_sync        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at                  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at                  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
