-- ============================================================
-- V23: Cultural Quiz — questions, options & user results
-- ============================================================

CREATE TABLE quiz_question (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    question_text   VARCHAR(500)    NOT NULL,
    category        VARCHAR(60)     NOT NULL DEFAULT 'CULTURE',
    difficulty      VARCHAR(20)     NOT NULL DEFAULT 'MEDIUM',
    country         VARCHAR(60),
    explanation     VARCHAR(500),
    xp_reward       INT             NOT NULL DEFAULT 10,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_qq_category (category),
    INDEX idx_qq_country (country)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE quiz_option (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    question_id     BIGINT          NOT NULL,
    option_text     VARCHAR(300)    NOT NULL,
    is_correct      BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_qo_question (question_id),
    CONSTRAINT fk_qo_question FOREIGN KEY (question_id) REFERENCES quiz_question(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE quiz_result (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    score           INT             NOT NULL DEFAULT 0,
    total_questions INT             NOT NULL DEFAULT 0,
    xp_earned       INT             NOT NULL DEFAULT 0,
    completed_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_qr_user (user_id),
    CONSTRAINT fk_qr_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Seed quiz questions (European culture) ──────────────

INSERT INTO quiz_question (question_text, category, difficulty, country, explanation, xp_reward) VALUES
('¿En qué ciudad se encuentra la Sagrada Familia?', 'CULTURE', 'EASY', 'Spain', 'La Sagrada Familia es una basílica diseñada por Gaudí en Barcelona.', 10),
('¿Cuál es la moneda oficial de Polonia?', 'CULTURE', 'MEDIUM', 'Poland', 'Polonia usa el Złoty (PLN), no el Euro.', 15),
('¿Qué país inventó la pizza Margherita?', 'GASTRONOMY', 'EASY', 'Italy', 'Fue creada en Nápoles en honor a la reina Margherita de Saboya.', 10),
('¿En qué ciudad se encuentra el Manneken Pis?', 'CULTURE', 'MEDIUM', 'Belgium', 'Esta famosa estatua se encuentra en Bruselas, Bélgica.', 15),
('¿Cuál es el río más largo de Europa?', 'GEOGRAPHY', 'MEDIUM', 'Russia', 'El Volga, con 3.530 km, es el río más largo de Europa.', 15),
('¿Qué programa europeo de intercambio universitario se creó en 1987?', 'EDUCATION', 'EASY', NULL, 'El programa Erasmus fue creado por la UE en 1987.', 10),
('¿En qué país se originó el vals?', 'CULTURE', 'HARD', 'Austria', 'El vals se originó en Viena, Austria, en el siglo XVIII.', 20),
('¿Cuál es la capital de Eslovenia?', 'GEOGRAPHY', 'HARD', 'Slovenia', 'Liubliana es la capital y ciudad más grande de Eslovenia.', 20),
('¿Qué festividad se celebra en Alemania con cerveza y pretzels?', 'GASTRONOMY', 'EASY', 'Germany', 'El Oktoberfest se celebra anualmente en Múnich.', 10),
('¿Cuántos países forman parte de la Unión Europea (2024)?', 'EDUCATION', 'MEDIUM', NULL, 'La UE tiene 27 estados miembros desde la salida del Reino Unido.', 15);

-- Options for Q1: Sagrada Familia
INSERT INTO quiz_option (question_id, option_text, is_correct) VALUES
(1, 'Madrid', FALSE), (1, 'Barcelona', TRUE), (1, 'Sevilla', FALSE), (1, 'Valencia', FALSE);

-- Options for Q2: Moneda de Polonia
INSERT INTO quiz_option (question_id, option_text, is_correct) VALUES
(2, 'Euro', FALSE), (2, 'Złoty', TRUE), (2, 'Corona', FALSE), (2, 'Leu', FALSE);

-- Options for Q3: Pizza Margherita
INSERT INTO quiz_option (question_id, option_text, is_correct) VALUES
(3, 'Francia', FALSE), (3, 'Grecia', FALSE), (3, 'Italia', TRUE), (3, 'España', FALSE);

-- Options for Q4: Manneken Pis
INSERT INTO quiz_option (question_id, option_text, is_correct) VALUES
(4, 'Ámsterdam', FALSE), (4, 'Bruselas', TRUE), (4, 'Luxemburgo', FALSE), (4, 'París', FALSE);

-- Options for Q5: Río más largo
INSERT INTO quiz_option (question_id, option_text, is_correct) VALUES
(5, 'Danubio', FALSE), (5, 'Rin', FALSE), (5, 'Volga', TRUE), (5, 'Sena', FALSE);

-- Options for Q6: Programa Erasmus
INSERT INTO quiz_option (question_id, option_text, is_correct) VALUES
(6, 'Erasmus', TRUE), (6, 'Bologna', FALSE), (6, 'Socrates', FALSE), (6, 'Horizon', FALSE);

-- Options for Q7: Vals
INSERT INTO quiz_option (question_id, option_text, is_correct) VALUES
(7, 'Francia', FALSE), (7, 'Austria', TRUE), (7, 'Alemania', FALSE), (7, 'Hungría', FALSE);

-- Options for Q8: Capital de Eslovenia
INSERT INTO quiz_option (question_id, option_text, is_correct) VALUES
(8, 'Zagreb', FALSE), (8, 'Bratislava', FALSE), (8, 'Liubliana', TRUE), (8, 'Sarajevo', FALSE);

-- Options for Q9: Oktoberfest
INSERT INTO quiz_option (question_id, option_text, is_correct) VALUES
(9, 'Carnaval', FALSE), (9, 'Tomatina', FALSE), (9, 'Oktoberfest', TRUE), (9, 'San Fermín', FALSE);

-- Options for Q10: Países UE
INSERT INTO quiz_option (question_id, option_text, is_correct) VALUES
(10, '25', FALSE), (10, '27', TRUE), (10, '30', FALSE), (10, '28', FALSE);
