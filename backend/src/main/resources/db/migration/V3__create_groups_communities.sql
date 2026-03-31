-- =====================================================
-- V3: Grupos, Comunidades y Chats Grupales
-- =====================================================

-- ── 1. Tabla de grupos ──────────────────────────────

CREATE TABLE `chat_group` (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    avatar_url      VARCHAR(512),
    creator_id      BIGINT NOT NULL,
    max_members     INT NOT NULL DEFAULT 50,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_group_creator FOREIGN KEY (creator_id) REFERENCES user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 2. Miembros de grupo ────────────────────────────

CREATE TABLE group_member (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id        BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    role            ENUM('ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    last_read_message_id BIGINT,
    joined_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_gm_group FOREIGN KEY (group_id) REFERENCES chat_group(id) ON DELETE CASCADE,
    CONSTRAINT fk_gm_user  FOREIGN KEY (user_id)  REFERENCES user(id),
    CONSTRAINT uq_group_member UNIQUE (group_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_gm_group ON group_member(group_id);
CREATE INDEX idx_gm_user  ON group_member(user_id);

-- ── 3. Mensajes de grupo ────────────────────────────

CREATE TABLE group_message (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id        BIGINT NOT NULL,
    sender_id       BIGINT NOT NULL,
    content         TEXT,
    type            ENUM('TEXT', 'IMAGE', 'LOCATION') NOT NULL DEFAULT 'TEXT',
    media_url       VARCHAR(512),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_gmsg_group  FOREIGN KEY (group_id)  REFERENCES chat_group(id) ON DELETE CASCADE,
    CONSTRAINT fk_gmsg_sender FOREIGN KEY (sender_id) REFERENCES user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_gmsg_group     ON group_message(group_id);
CREATE INDEX idx_gmsg_created   ON group_message(group_id, created_at DESC);

-- ── 4. Comunidades ──────────────────────────────────

CREATE TABLE community (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    category        ENUM('UNIVERSITY', 'CITY', 'INTEREST', 'GENERAL') NOT NULL DEFAULT 'GENERAL',
    cover_image_url VARCHAR(512),
    is_public       BOOLEAN NOT NULL DEFAULT TRUE,
    member_count    INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_community_category ON community(category);
CREATE INDEX idx_community_name     ON community(name);

-- ── 5. Miembros de comunidad ────────────────────────

CREATE TABLE community_member (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    community_id    BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    role            ENUM('ADMIN', 'MODERATOR', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    status          ENUM('ACTIVE', 'PENDING') NOT NULL DEFAULT 'ACTIVE',
    joined_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cm_community FOREIGN KEY (community_id) REFERENCES community(id) ON DELETE CASCADE,
    CONSTRAINT fk_cm_user      FOREIGN KEY (user_id)      REFERENCES user(id),
    CONSTRAINT uq_community_member UNIQUE (community_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_cm_community ON community_member(community_id);
CREATE INDEX idx_cm_user      ON community_member(user_id);

-- ── 6. Publicaciones de comunidad ───────────────────

CREATE TABLE community_post (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    community_id    BIGINT NOT NULL,
    author_id       BIGINT NOT NULL,
    content         TEXT NOT NULL,
    image_url       VARCHAR(512),
    like_count      INT NOT NULL DEFAULT 0,
    comment_count   INT NOT NULL DEFAULT 0,
    is_pinned       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cp_community FOREIGN KEY (community_id) REFERENCES community(id) ON DELETE CASCADE,
    CONSTRAINT fk_cp_author    FOREIGN KEY (author_id)    REFERENCES user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_cp_community ON community_post(community_id, created_at DESC);

-- ── 7. Comentarios en publicaciones ─────────────────

CREATE TABLE community_comment (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id         BIGINT NOT NULL,
    author_id       BIGINT NOT NULL,
    content         TEXT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cc_post   FOREIGN KEY (post_id)   REFERENCES community_post(id) ON DELETE CASCADE,
    CONSTRAINT fk_cc_author FOREIGN KEY (author_id) REFERENCES user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_cc_post ON community_comment(post_id, created_at ASC);

-- ── 8. Likes en publicaciones ───────────────────────

CREATE TABLE community_post_like (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id         BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cpl_post FOREIGN KEY (post_id) REFERENCES community_post(id) ON DELETE CASCADE,
    CONSTRAINT fk_cpl_user FOREIGN KEY (user_id) REFERENCES user(id),
    CONSTRAINT uq_post_like UNIQUE (post_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
