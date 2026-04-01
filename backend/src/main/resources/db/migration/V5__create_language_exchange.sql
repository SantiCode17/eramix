-- ============================================================
-- V5: Language Exchange / Intercambio de idiomas
-- ============================================================

-- ── Solicitudes de intercambio de idioma ─────────────
CREATE TABLE language_exchange_request (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    requester_id    BIGINT        NOT NULL,
    target_id       BIGINT        NOT NULL,
    offer_language_id   BIGINT    NOT NULL,
    want_language_id    BIGINT    NOT NULL,
    message         TEXT,
    status          VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id)      REFERENCES user(id),
    FOREIGN KEY (target_id)         REFERENCES user(id),
    FOREIGN KEY (offer_language_id) REFERENCES language(id),
    FOREIGN KEY (want_language_id)  REFERENCES language(id),
    UNIQUE KEY uq_exchange_request (requester_id, target_id, offer_language_id, want_language_id)
);

-- ── Sesiones de intercambio ─────────────────────────
CREATE TABLE exchange_session (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id      BIGINT        NOT NULL,
    user_a_id       BIGINT        NOT NULL,
    user_b_id       BIGINT        NOT NULL,
    scheduled_at    TIMESTAMP     NULL,
    duration_minutes INT          NULL,
    status          VARCHAR(20)   NOT NULL DEFAULT 'SCHEDULED',
    notes           TEXT,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES language_exchange_request(id),
    FOREIGN KEY (user_a_id)  REFERENCES user(id),
    FOREIGN KEY (user_b_id)  REFERENCES user(id)
);

-- ── Reseñas de sesiones ─────────────────────────────
CREATE TABLE exchange_review (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id      BIGINT        NOT NULL,
    reviewer_id     BIGINT        NOT NULL,
    reviewee_id     BIGINT        NOT NULL,
    rating          INT           NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id)  REFERENCES exchange_session(id),
    FOREIGN KEY (reviewer_id) REFERENCES user(id),
    FOREIGN KEY (reviewee_id) REFERENCES user(id),
    UNIQUE KEY uq_review (session_id, reviewer_id)
);
