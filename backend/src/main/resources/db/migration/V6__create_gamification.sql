-- ============================================================
-- V6: Gamification – achievements, levels & XP
-- ============================================================

CREATE TABLE achievement (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    code        VARCHAR(60)  NOT NULL UNIQUE,
    name        VARCHAR(120) NOT NULL,
    description VARCHAR(500) NOT NULL,
    emoji       VARCHAR(10)  NOT NULL DEFAULT '🏆',
    xp_reward   INT          NOT NULL DEFAULT 0,
    category    VARCHAR(40)  NOT NULL DEFAULT 'GENERAL',
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_achievement (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT    NOT NULL,
    achievement_id BIGINT    NOT NULL,
    unlocked_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_achievement (user_id, achievement_id),
    CONSTRAINT fk_ua_user       FOREIGN KEY (user_id)        REFERENCES users(id),
    CONSTRAINT fk_ua_achievement FOREIGN KEY (achievement_id) REFERENCES achievement(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_level (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT NOT NULL UNIQUE,
    level      INT    NOT NULL DEFAULT 1,
    current_xp INT    NOT NULL DEFAULT 0,
    total_xp   INT    NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ul_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE xp_transaction (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    amount      INT          NOT NULL,
    reason      VARCHAR(200) NOT NULL,
    source_type VARCHAR(40)  NOT NULL DEFAULT 'SYSTEM',
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_xp_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default achievements
INSERT INTO achievement (code, name, description, emoji, xp_reward, category) VALUES
('FIRST_LOGIN',       'Primer Paso',          'Inicia sesión por primera vez',              '👣', 10,  'GENERAL'),
('PROFILE_COMPLETE',  'Perfil Completo',      'Completa tu perfil al 100%',                 '✨', 25,  'PROFILE'),
('FIRST_FRIEND',      'Primer Amigo',         'Añade tu primer amigo',                      '🤝', 15,  'SOCIAL'),
('FIVE_FRIENDS',      '5 Amigos',             'Consigue 5 amigos',                          '👥', 30,  'SOCIAL'),
('FIRST_MESSAGE',     'Primer Mensaje',       'Envía tu primer mensaje',                    '💬', 10,  'SOCIAL'),
('FIRST_EVENT',       'Organizador',          'Crea tu primer evento',                      '🎉', 20,  'EVENTS'),
('JOIN_EVENT',        'Participante',         'Únete a tu primer evento',                   '🎫', 10,  'EVENTS'),
('FIRST_EXCHANGE',    'Políglota',            'Completa tu primera sesión de intercambio',   '🗣️', 25,  'EXCHANGE'),
('FIRST_STORY',       'Storyteller',          'Publica tu primera historia',                 '📖', 10,  'CONTENT'),
('JOIN_GROUP',        'Miembro de Grupo',     'Únete a tu primer grupo',                     '👥', 10,  'SOCIAL'),
('JOIN_COMMUNITY',    'Comunitario',          'Únete a tu primera comunidad',                '🏘️', 10,  'SOCIAL'),
('FIRST_POST',        'Creador de Contenido', 'Publica tu primer post en una comunidad',     '📝', 15,  'CONTENT'),
('GLOBE_EXPLORER',    'Explorador Global',    'Descubre 5 universidades en el mapa',         '🌍', 20,  'EXPLORE'),
('TEN_EXCHANGES',     'Maestro Lingüista',    'Completa 10 sesiones de intercambio',          '🏅', 50,  'EXCHANGE'),
('STREAK_7',          'Racha Semanal',        'Inicia sesión 7 días seguidos',                '🔥', 35,  'GENERAL');
