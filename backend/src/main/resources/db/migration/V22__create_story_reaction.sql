-- ============================================================
-- V22: Story Reactions — emoji reactions on stories
-- ============================================================

CREATE TABLE story_reaction (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    story_id    BIGINT          NOT NULL,
    user_id     BIGINT          NOT NULL,
    emoji       VARCHAR(10)     NOT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE INDEX uq_story_reaction (story_id, user_id),
    INDEX idx_sr_user (user_id),
    CONSTRAINT fk_sr_story FOREIGN KEY (story_id) REFERENCES story(id) ON DELETE CASCADE,
    CONSTRAINT fk_sr_user  FOREIGN KEY (user_id)  REFERENCES user(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
