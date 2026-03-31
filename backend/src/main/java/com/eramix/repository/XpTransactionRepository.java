package com.eramix.repository;

import com.eramix.entity.XpTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface XpTransactionRepository extends JpaRepository<XpTransaction, Long> {
    List<XpTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
}
