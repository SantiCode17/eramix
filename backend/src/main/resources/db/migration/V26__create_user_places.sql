-- ╔════════════════════════════════════════════════╗
-- ║  V26 — User Places (Bucket-List personal)     ║
-- ╚════════════════════════════════════════════════╝

CREATE TABLE user_place (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    category    VARCHAR(30)  NOT NULL DEFAULT 'OTHER',
    priority    VARCHAR(10)  NOT NULL DEFAULT 'MEDIUM',
    visited     BOOLEAN      NOT NULL DEFAULT FALSE,
    rating      INT,
    maps_url    VARCHAR(500),
    notes       TEXT,
    target_date DATE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_user_place_user (user_id),
    INDEX idx_user_place_visited (user_id, visited),
    CONSTRAINT fk_user_place_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
