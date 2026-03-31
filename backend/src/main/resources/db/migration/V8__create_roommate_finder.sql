-- ============================================================
-- V8: Roommate Finder – housing posts and preferences
-- ============================================================

CREATE TABLE housing_post (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT        NOT NULL,
    title           VARCHAR(200)  NOT NULL,
    description     VARCHAR(2000) NOT NULL,
    city            VARCHAR(100)  NOT NULL,
    address         VARCHAR(300),
    monthly_rent    DECIMAL(10,2) NOT NULL,
    currency        VARCHAR(3)    NOT NULL DEFAULT 'EUR',
    available_from  DATE          NOT NULL,
    available_until DATE,
    rooms_available INT           NOT NULL DEFAULT 1,
    post_type       VARCHAR(20)   NOT NULL DEFAULT 'OFFER',
    photo_url       VARCHAR(512),
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_hp_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE roommate_preference (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT       NOT NULL UNIQUE,
    max_budget      DECIMAL(10,2),
    preferred_city  VARCHAR(100),
    move_in_date    DATE,
    smoking         BOOLEAN      DEFAULT FALSE,
    pets_ok         BOOLEAN      DEFAULT TRUE,
    night_owl       BOOLEAN      DEFAULT FALSE,
    bio             VARCHAR(500),
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rp_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
