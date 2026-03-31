package com.eramix.repository;

import com.eramix.entity.AiConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AiConversationRepository extends JpaRepository<AiConversation, Long> {
    List<AiConversation> findByUserIdOrderByUpdatedAtDesc(Long userId);
}
