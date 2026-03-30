-- =============================================
-- EraMix — V1: Create complete database schema
-- =============================================

-- -----------------------------------------------
-- Catálogos
-- -----------------------------------------------

CREATE TABLE university (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    city            VARCHAR(150)    NOT NULL,
    country         VARCHAR(100)    NOT NULL,
    latitude        DECIMAL(10, 7),
    longitude       DECIMAL(10, 7),
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE interest (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL UNIQUE,
    category        VARCHAR(50)     NOT NULL,
    emoji           VARCHAR(10),
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE language (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(10)     NOT NULL UNIQUE,
    name            VARCHAR(100)    NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Usuario
-- -----------------------------------------------

CREATE TABLE user (
    id                      BIGINT          AUTO_INCREMENT PRIMARY KEY,
    email                   VARCHAR(255)    NOT NULL UNIQUE,
    password_hash           VARCHAR(255)    NOT NULL,
    role                    VARCHAR(20)     NOT NULL DEFAULT 'USER',
    first_name              VARCHAR(100)    NOT NULL,
    last_name               VARCHAR(100)    NOT NULL,
    profile_photo_url       VARCHAR(512),
    date_of_birth           DATE,
    bio                     TEXT,
    home_university_id      BIGINT,
    host_university_id      BIGINT,
    destination_city        VARCHAR(150),
    destination_country     VARCHAR(100),
    mobility_start          DATE,
    mobility_end            DATE,
    latitude                DECIMAL(10, 7),
    longitude               DECIMAL(10, 7),
    location_updated_at     TIMESTAMP       NULL,
    is_active               BOOLEAN         NOT NULL DEFAULT TRUE,
    is_verified             BOOLEAN         NOT NULL DEFAULT FALSE,
    last_seen               TIMESTAMP       NULL,
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_user_email (email),
    INDEX idx_user_destination_city (destination_city),
    INDEX idx_user_destination_country (destination_country),
    INDEX idx_user_home_uni (home_university_id),
    INDEX idx_user_host_uni (host_university_id),

    CONSTRAINT fk_user_home_uni FOREIGN KEY (home_university_id) REFERENCES university(id) ON DELETE SET NULL,
    CONSTRAINT fk_user_host_uni FOREIGN KEY (host_university_id) REFERENCES university(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Relaciones de usuario
-- -----------------------------------------------

CREATE TABLE user_interest (
    user_id         BIGINT  NOT NULL,
    interest_id     BIGINT  NOT NULL,
    PRIMARY KEY (user_id, interest_id),
    CONSTRAINT fk_ui_user     FOREIGN KEY (user_id)     REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT fk_ui_interest FOREIGN KEY (interest_id) REFERENCES interest(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_language (
    user_id             BIGINT      NOT NULL,
    language_id         BIGINT      NOT NULL,
    proficiency_level   VARCHAR(20) NOT NULL DEFAULT 'BASIC',
    PRIMARY KEY (user_id, language_id),
    CONSTRAINT fk_ul_user     FOREIGN KEY (user_id)     REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT fk_ul_language FOREIGN KEY (language_id) REFERENCES language(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_photo (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    photo_url       VARCHAR(512)    NOT NULL,
    display_order   INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_photo_user (user_id),
    CONSTRAINT fk_photo_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Social
-- -----------------------------------------------

CREATE TABLE friend_request (
    id              BIGINT      AUTO_INCREMENT PRIMARY KEY,
    sender_id       BIGINT      NOT NULL,
    receiver_id     BIGINT      NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE INDEX uq_friend_request (sender_id, receiver_id),
    INDEX idx_fr_receiver (receiver_id),
    CONSTRAINT fk_fr_sender   FOREIGN KEY (sender_id)   REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT fk_fr_receiver FOREIGN KEY (receiver_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE friendship (
    id              BIGINT      AUTO_INCREMENT PRIMARY KEY,
    user_id_1       BIGINT      NOT NULL,
    user_id_2       BIGINT      NOT NULL,
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE INDEX uq_friendship (user_id_1, user_id_2),
    INDEX idx_friendship_u2 (user_id_2),
    CONSTRAINT fk_friendship_u1 FOREIGN KEY (user_id_1) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT fk_friendship_u2 FOREIGN KEY (user_id_2) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Mensajería
-- -----------------------------------------------

CREATE TABLE conversation (
    id              BIGINT      AUTO_INCREMENT PRIMARY KEY,
    user_id_1       BIGINT      NOT NULL,
    user_id_2       BIGINT      NOT NULL,
    last_message_at TIMESTAMP   NULL,
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE INDEX uq_conversation (user_id_1, user_id_2),
    INDEX idx_conv_u2 (user_id_2),
    CONSTRAINT fk_conv_u1 FOREIGN KEY (user_id_1) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT fk_conv_u2 FOREIGN KEY (user_id_2) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE message (
    id                  BIGINT          AUTO_INCREMENT PRIMARY KEY,
    conversation_id     BIGINT          NOT NULL,
    sender_id           BIGINT          NOT NULL,
    content             TEXT,
    type                VARCHAR(20)     NOT NULL DEFAULT 'TEXT',
    media_url           VARCHAR(512),
    is_read             BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_msg_conv_date (conversation_id, created_at),
    INDEX idx_msg_sender (sender_id),
    CONSTRAINT fk_msg_conv   FOREIGN KEY (conversation_id) REFERENCES conversation(id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id)       REFERENCES user(id)         ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Eventos
-- -----------------------------------------------

CREATE TABLE event (
    id                  BIGINT          AUTO_INCREMENT PRIMARY KEY,
    creator_id          BIGINT          NOT NULL,
    title               VARCHAR(255)    NOT NULL,
    description         TEXT,
    category            VARCHAR(50),
    location            VARCHAR(255),
    latitude            DECIMAL(10, 7),
    longitude           DECIMAL(10, 7),
    start_datetime      TIMESTAMP       NOT NULL,
    end_datetime        TIMESTAMP       NULL,
    max_participants    INT,
    is_public           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_event_creator (creator_id),
    INDEX idx_event_start (start_datetime),
    CONSTRAINT fk_event_creator FOREIGN KEY (creator_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE event_participant (
    event_id    BIGINT      NOT NULL,
    user_id     BIGINT      NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'GOING',
    joined_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, user_id),
    CONSTRAINT fk_ep_event FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE,
    CONSTRAINT fk_ep_user  FOREIGN KEY (user_id)  REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Stories
-- -----------------------------------------------

CREATE TABLE story (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    media_url       VARCHAR(512)    NOT NULL,
    caption         VARCHAR(500),
    expires_at      TIMESTAMP       NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_story_user (user_id),
    INDEX idx_story_expires (expires_at),
    CONSTRAINT fk_story_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE story_view (
    id          BIGINT      AUTO_INCREMENT PRIMARY KEY,
    story_id    BIGINT      NOT NULL,
    viewer_id   BIGINT      NOT NULL,
    viewed_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX uq_story_view (story_id, viewer_id),
    INDEX idx_sv_viewer (viewer_id),
    CONSTRAINT fk_sv_story  FOREIGN KEY (story_id)  REFERENCES story(id) ON DELETE CASCADE,
    CONSTRAINT fk_sv_viewer FOREIGN KEY (viewer_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Notificaciones
-- -----------------------------------------------

CREATE TABLE notification (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT          NOT NULL,
    type        VARCHAR(50)     NOT NULL,
    title       VARCHAR(255)    NOT NULL,
    body        TEXT,
    data        JSON,
    is_read     BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_notif_user_read (user_id, is_read),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Auth
-- -----------------------------------------------

CREATE TABLE refresh_token (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT          NOT NULL,
    token_hash  VARCHAR(255)    NOT NULL UNIQUE,
    expires_at  TIMESTAMP       NOT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_rt_user (user_id),
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
