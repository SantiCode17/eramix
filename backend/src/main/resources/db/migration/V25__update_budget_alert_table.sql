-- =============================================================================
-- V25: Actualizar tabla budget_alert con nuevas columnas
-- =============================================================================

-- Agregar columnas si no existen
ALTER TABLE budget_alert ADD COLUMN budget_id BIGINT AFTER user_id;
ALTER TABLE budget_alert ADD COLUMN spent_amount DECIMAL(12,2) AFTER alert_type;
ALTER TABLE budget_alert ADD COLUMN limit_amount DECIMAL(12,2) AFTER spent_amount;
ALTER TABLE budget_alert ADD COLUMN progress_percentage DOUBLE AFTER limit_amount;
ALTER TABLE budget_alert ADD COLUMN alert_level VARCHAR(20) DEFAULT 'WARNING' AFTER progress_percentage;

-- Agregar FK a budget si no existe
ALTER TABLE budget_alert ADD CONSTRAINT fk_budget_alert_budget 
  FOREIGN KEY (budget_id) REFERENCES budget(id) ON DELETE CASCADE;

-- Agregar índice para budget_id
ALTER TABLE budget_alert ADD INDEX idx_budget_alert_budget (budget_id);
