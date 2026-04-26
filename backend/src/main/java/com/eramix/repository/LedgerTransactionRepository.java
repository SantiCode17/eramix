package com.eramix.repository;

import com.eramix.entity.LedgerTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface LedgerTransactionRepository extends JpaRepository<LedgerTransaction, Long> {
    List<LedgerTransaction> findByUserIdOrderByTransactionDateDesc(Long userId);

    List<LedgerTransaction> findByUserIdAndTransactionDateBetween(Long userId, LocalDate start, LocalDate end);

    List<LedgerTransaction> findByUserIdAndCategoryId(Long userId, Long categoryId);

    @Query("SELECT COALESCE(SUM(t.amountInBaseCurrency), 0) FROM LedgerTransaction t " +
           "WHERE t.userId = :userId AND t.transactionType = 'EXPENSE' " +
           "AND t.transactionDate >= :since")
    BigDecimal sumExpensesSince(Long userId, LocalDate since);

    @Query("SELECT COALESCE(SUM(t.amountInBaseCurrency), 0) FROM LedgerTransaction t " +
           "WHERE t.userId = :userId AND t.transactionType = 'EXPENSE'")
    BigDecimal totalExpenses(Long userId);

    @Query("SELECT COALESCE(SUM(t.amountInBaseCurrency), 0) FROM LedgerTransaction t " +
           "WHERE t.userId = :userId AND t.transactionType = 'INCOME'")
    BigDecimal totalIncome(Long userId);
}
