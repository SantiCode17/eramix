-- V9: City Guide – places & reviews
CREATE TABLE place (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200)  NOT NULL,
    description TEXT,
    category    VARCHAR(50)   NOT NULL,
    address     VARCHAR(300),
    city        VARCHAR(100)  NOT NULL,
    latitude    DOUBLE,
    longitude   DOUBLE,
    image_url   VARCHAR(500),
    user_id     BIGINT        NOT NULL,
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE place_review (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    place_id   BIGINT   NOT NULL,
    user_id    BIGINT   NOT NULL,
    rating     INT      NOT NULL,
    comment    TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (place_id) REFERENCES place(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)  REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_place_city     ON place(city);
CREATE INDEX idx_place_category ON place(category);
CREATE INDEX idx_review_place   ON place_review(place_id);
