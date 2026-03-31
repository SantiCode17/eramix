package com.eramix.repository;

import com.eramix.entity.AiMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AiMessageRepository extends JpaRepository<AiMessage, Long> {
    List<AiMessage> findByAiConversationIdOrderByCreatedAtAsc(Long conversationId);
}
