package com.eramix.repository;

import com.eramix.entity.BudgetAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BudgetAlertRepository extends JpaRepository<BudgetAlert, Long> {
    List<BudgetAlert> findByUserIdAndIsAcknowledgedFalseOrderByCreatedAtDesc(Long userId);
    List<BudgetAlert> findByUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByBudgetIdAndAlertLevel(Long budgetId, String alertLevel);
    Long countByUserIdAndIsAcknowledgedFalse(Long userId);
}
