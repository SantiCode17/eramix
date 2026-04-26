-- =============================================================================
-- V13: Fase 22 — Tablas de OCR y procesamiento de documentos
-- =============================================================================

CREATE TABLE optical_record (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT NOT NULL,
    scan_uuid           VARCHAR(36) NOT NULL UNIQUE,
    original_filename   VARCHAR(255),
    image_url           VARCHAR(512),
    raw_text            TEXT,
    document_type       VARCHAR(30) NOT NULL DEFAULT 'UNKNOWN',
    confidence_score    DOUBLE DEFAULT 0.0,
    language_detected   VARCHAR(10),
    status              VARCHAR(20) NOT NULL DEFAULT 'PROCESSING',
    processed_at        DATETIME(6),
    created_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_optical_record_user (user_id),
    INDEX idx_optical_record_uuid (scan_uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE extracted_entity (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    optical_record_id   BIGINT NOT NULL,
    entity_type         VARCHAR(50) NOT NULL,
    field_name          VARCHAR(100) NOT NULL,
    field_value         VARCHAR(500),
    confidence          DOUBLE DEFAULT 0.0,
    needs_review        BOOLEAN NOT NULL DEFAULT FALSE,
    bbox_x              INT,
    bbox_y              INT,
    bbox_width          INT,
    bbox_height         INT,
    created_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (optical_record_id) REFERENCES optical_record(id) ON DELETE CASCADE,
    INDEX idx_extracted_entity_record (optical_record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
