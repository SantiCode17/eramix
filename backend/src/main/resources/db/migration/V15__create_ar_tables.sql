-- =============================================================================
-- V15: Fase 24 — Tablas de Realidad Aumentada (edificios campus)
-- =============================================================================

CREATE TABLE campus_building (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    university_id       BIGINT,
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    building_type       VARCHAR(50) NOT NULL DEFAULT 'ACADEMIC',
    latitude            DECIMAL(10,7) NOT NULL,
    longitude           DECIMAL(10,7) NOT NULL,
    altitude            DECIMAL(8,2) DEFAULT 0,
    floor_count         INT DEFAULT 1,
    opening_hours       VARCHAR(255),
    services            JSON,
    model_url           VARCHAR(512),
    image_url           VARCHAR(512),
    created_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (university_id) REFERENCES university(id) ON DELETE SET NULL,
    INDEX idx_campus_building_uni (university_id),
    INDEX idx_campus_building_coords (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
