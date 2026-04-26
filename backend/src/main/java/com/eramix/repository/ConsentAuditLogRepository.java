package com.eramix.repository;

import com.eramix.entity.ConsentAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConsentAuditLogRepository extends JpaRepository<ConsentAuditLog, Long> {
    List<ConsentAuditLog> findByUserIdOrderByCreatedAtDesc(Long userId);
}
