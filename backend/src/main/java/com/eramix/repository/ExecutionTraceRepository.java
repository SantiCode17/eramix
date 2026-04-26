package com.eramix.repository;

import com.eramix.entity.ExecutionTrace;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExecutionTraceRepository extends JpaRepository<ExecutionTrace, Long> {
    List<ExecutionTrace> findBySessionIdOrderByCreatedAtAsc(Long sessionId);
}
