-- =============================================================================
-- V16: Fase 25 — Tablas de gestión financiera predictiva
-- =============================================================================

CREATE TABLE spending_category (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    icon        VARCHAR(50),
    color       VARCHAR(7),
    created_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO spending_category (name, icon, color, created_at, updated_at) VALUES
('Alimentación', 'fast-food-outline', '#FF6D3F', NOW(6), NOW(6)),
('Transporte', 'bus-outline', '#3B6BFF', NOW(6), NOW(6)),
('Alojamiento', 'home-outline', '#00D68F', NOW(6), NOW(6)),
('Ocio', 'game-controller-outline', '#FFD700', NOW(6), NOW(6)),
('Académico', 'school-outline', '#8B5CF6', NOW(6), NOW(6)),
('Salud', 'medkit-outline', '#FF4F6F', NOW(6), NOW(6)),
('Otro', 'ellipsis-horizontal-outline', '#6B7280', NOW(6), NOW(6));

CREATE TABLE grant_allocation (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id                 BIGINT NOT NULL,
    source_name             VARCHAR(100) NOT NULL DEFAULT 'Beca Erasmus+',
    total_amount            DECIMAL(12,2) NOT NULL,
    currency                VARCHAR(3) NOT NULL DEFAULT 'EUR',
    mobility_start_date     DATE NOT NULL,
    mobility_end_date       DATE NOT NULL,
    disbursement_schedule   JSON,
    notes                   TEXT,
    created_at              DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at              DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_grant_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ledger_transaction (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id                 BIGINT NOT NULL,
    amount                  DECIMAL(12,2) NOT NULL,
    currency                VARCHAR(3) NOT NULL DEFAULT 'EUR',
    amount_in_base_currency DECIMAL(12,2) NOT NULL,
    category_id             BIGINT,
    description             VARCHAR(500),
    transaction_date        DATE NOT NULL,
    transaction_type        VARCHAR(20) NOT NULL DEFAULT 'EXPENSE',
    receipt_id              BIGINT,
    created_at              DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at              DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES spending_category(id) ON DELETE SET NULL,
    FOREIGN KEY (receipt_id) REFERENCES optical_record(id) ON DELETE SET NULL,
    INDEX idx_ledger_user (user_id),
    INDEX idx_ledger_date (transaction_date),
    INDEX idx_ledger_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE budget_alert (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id                 BIGINT NOT NULL,
    alert_type              VARCHAR(30) NOT NULL,
    message                 VARCHAR(500) NOT NULL,
    projected_run_out_date  DATE,
    is_acknowledged         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at              DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_budget_alert_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE exchange_rate_cache (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    base_currency   VARCHAR(3) NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    rate            DECIMAL(16,8) NOT NULL,
    fetched_at      DATETIME(6) NOT NULL,
    created_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    UNIQUE KEY uk_exchange_rate (base_currency, target_currency),
    INDEX idx_exchange_rate_base (base_currency)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
