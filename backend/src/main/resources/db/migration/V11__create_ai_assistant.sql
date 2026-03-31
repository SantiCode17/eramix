-- V11: AI Assistant – conversations & messages
CREATE TABLE ai_conversation (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    title      VARCHAR(200) NOT NULL DEFAULT 'Nueva conversación',
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ai_message (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    ai_conversation_id  BIGINT       NOT NULL,
    role                VARCHAR(20)  NOT NULL,  -- USER / ASSISTANT
    content             TEXT         NOT NULL,
    created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ai_conversation_id) REFERENCES ai_conversation(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_ai_conv_user ON ai_conversation(user_id);
CREATE INDEX idx_ai_msg_conv  ON ai_message(ai_conversation_id);
