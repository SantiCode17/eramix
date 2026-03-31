-- ============================================================
-- V7: Photo Challenges – erasmus photo challenges with voting
-- ============================================================

CREATE TABLE erasmus_challenge (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    description  VARCHAR(1000) NOT NULL,
    emoji        VARCHAR(10)  NOT NULL DEFAULT '📸',
    start_date   TIMESTAMP    NOT NULL,
    end_date     TIMESTAMP    NOT NULL,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_by   BIGINT       NOT NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_challenge_creator FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE challenge_submission (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    challenge_id  BIGINT       NOT NULL,
    user_id       BIGINT       NOT NULL,
    photo_url     VARCHAR(512) NOT NULL,
    caption       VARCHAR(500),
    vote_count    INT          NOT NULL DEFAULT 0,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_challenge_user (challenge_id, user_id),
    CONSTRAINT fk_sub_challenge FOREIGN KEY (challenge_id) REFERENCES erasmus_challenge(id),
    CONSTRAINT fk_sub_user      FOREIGN KEY (user_id)      REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE challenge_vote (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    submission_id BIGINT    NOT NULL,
    user_id       BIGINT    NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_vote_user (submission_id, user_id),
    CONSTRAINT fk_vote_submission FOREIGN KEY (submission_id) REFERENCES challenge_submission(id),
    CONSTRAINT fk_vote_user       FOREIGN KEY (user_id)       REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
