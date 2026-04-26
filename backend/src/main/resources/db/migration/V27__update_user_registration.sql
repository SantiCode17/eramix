-- Borrar todas las cuentas actuales (FK checks off para evitar errores de constraint)
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM user;
SET FOREIGN_KEY_CHECKS = 1;

-- Nuevas columnas en la tabla user
ALTER TABLE user
ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
ADD COLUMN provider_id VARCHAR(255),
ADD COLUMN degree VARCHAR(150),
ADD COLUMN gender VARCHAR(20),
ADD COLUMN looking_for_gender VARCHAR(20),
ADD COLUMN show_gender_on_profile BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN notifications_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- Tabla para intenciones (Selección múltiple de intenciones)
CREATE TABLE IF NOT EXISTS user_intention (
    user_id BIGINT NOT NULL,
    intention VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, intention),
    CONSTRAINT fk_user_intention_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
