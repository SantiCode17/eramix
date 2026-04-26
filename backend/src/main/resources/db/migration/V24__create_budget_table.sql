-- =============================================================================
-- V24: Crear tabla de presupuestos
-- =============================================================================

CREATE TABLE budget (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT NOT NULL,
    category_id         BIGINT NOT NULL,
    limit_amount        DECIMAL(12,2) NOT NULL,
    cycle               VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
    currency            VARCHAR(3) NOT NULL DEFAULT 'EUR',
    notes               TEXT,
    created_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES spending_category(id) ON DELETE CASCADE,
    INDEX idx_budget_user (user_id),
    INDEX idx_budget_category (category_id),
    UNIQUE KEY uk_budget_user_category_cycle (user_id, category_id, cycle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
