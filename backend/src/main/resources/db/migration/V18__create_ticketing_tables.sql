-- =============================================================================
-- V18: Fase 27 — Tablas de ticketing con QR TOTP
-- =============================================================================

CREATE TABLE ticket_listing (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id            BIGINT NOT NULL,
    price               DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency            VARCHAR(3) NOT NULL DEFAULT 'EUR',
    total_tickets       INT NOT NULL,
    remaining_tickets   INT NOT NULL,
    sales_start         DATETIME(6),
    sales_end           DATETIME(6),
    max_per_user        INT NOT NULL DEFAULT 4,
    version             INT NOT NULL DEFAULT 0,
    created_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE,
    INDEX idx_ticket_listing_event (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cryptographic_ticket (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_listing_id       BIGINT NOT NULL,
    buyer_id                BIGINT NOT NULL,
    ticket_uuid             VARCHAR(36) NOT NULL UNIQUE,
    totp_secret_hash        VARCHAR(255) NOT NULL,
    totp_secret_encrypted   VARCHAR(512) NOT NULL,
    stripe_payment_intent   VARCHAR(100),
    is_redeemed             BOOLEAN NOT NULL DEFAULT FALSE,
    redeemed_at             DATETIME(6),
    purchase_date           DATETIME(6) NOT NULL,
    created_at              DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at              DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (ticket_listing_id) REFERENCES ticket_listing(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_crypto_ticket_buyer (buyer_id),
    INDEX idx_crypto_ticket_uuid (ticket_uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ticket_redemption (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id       BIGINT NOT NULL,
    scanner_user_id BIGINT,
    device_info     VARCHAR(255),
    scanned_at      DATETIME(6) NOT NULL,
    created_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (ticket_id) REFERENCES cryptographic_ticket(id) ON DELETE CASCADE,
    UNIQUE KEY uk_ticket_redemption (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
