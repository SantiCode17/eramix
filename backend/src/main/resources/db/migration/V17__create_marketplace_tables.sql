-- =============================================================================
-- V17: Fase 26 — Tablas del mercado circular con escrow
-- =============================================================================

CREATE TABLE listing_category (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    icon        VARCHAR(50),
    created_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO listing_category (name, icon, created_at, updated_at) VALUES
('Mobiliario', 'bed-outline', NOW(6), NOW(6)),
('Electrónica', 'laptop-outline', NOW(6), NOW(6)),
('Ropa de cama', 'shirt-outline', NOW(6), NOW(6)),
('Libros', 'book-outline', NOW(6), NOW(6)),
('Bicicletas', 'bicycle-outline', NOW(6), NOW(6)),
('Utensilios de cocina', 'restaurant-outline', NOW(6), NOW(6)),
('Deportes', 'football-outline', NOW(6), NOW(6)),
('Otro', 'cube-outline', NOW(6), NOW(6));

CREATE TABLE marketplace_listing (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    seller_id           BIGINT NOT NULL,
    category_id         BIGINT,
    title               VARCHAR(200) NOT NULL,
    description         TEXT,
    price               DECIMAL(10,2) NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'EUR',
    item_condition      VARCHAR(30) NOT NULL DEFAULT 'GOOD',
    city                VARCHAR(150),
    latitude            DECIMAL(10,7),
    longitude           DECIMAL(10,7),
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    view_count          INT NOT NULL DEFAULT 0,
    stripe_account_id   VARCHAR(100),
    created_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (seller_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES listing_category(id) ON DELETE SET NULL,
    INDEX idx_marketplace_seller (seller_id),
    INDEX idx_marketplace_status (status),
    INDEX idx_marketplace_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE marketplace_photo (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    listing_id      BIGINT NOT NULL,
    photo_url       VARCHAR(512) NOT NULL,
    display_order   INT NOT NULL DEFAULT 0,
    created_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (listing_id) REFERENCES marketplace_listing(id) ON DELETE CASCADE,
    INDEX idx_mp_photo_listing (listing_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE escrow_transaction (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    listing_id              BIGINT NOT NULL,
    buyer_id                BIGINT NOT NULL,
    seller_id               BIGINT NOT NULL,
    amount                  DECIMAL(10,2) NOT NULL,
    currency                VARCHAR(3) NOT NULL DEFAULT 'EUR',
    stripe_payment_intent   VARCHAR(100),
    status                  VARCHAR(30) NOT NULL DEFAULT 'RESERVED',
    buyer_confirmed_at      DATETIME(6),
    seller_confirmed_at     DATETIME(6),
    completed_at            DATETIME(6),
    dispute_reason          TEXT,
    created_at              DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at              DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (listing_id) REFERENCES marketplace_listing(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_escrow_listing (listing_id),
    INDEX idx_escrow_buyer (buyer_id),
    INDEX idx_escrow_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
