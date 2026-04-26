package com.eramix.repository;

import com.eramix.entity.AgentSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AgentSessionRepository extends JpaRepository<AgentSession, Long> {
    Optional<AgentSession> findBySessionUuid(String sessionUuid);
    List<AgentSession> findByUserIdOrderByCreatedAtDesc(Long userId);
}
