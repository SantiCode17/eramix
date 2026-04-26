package com.eramix.service;

import com.eramix.dto.finance.*;
import com.eramix.entity.*;
import com.eramix.entity.enums.BudgetAlertType;
import com.eramix.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FinancialService {

    private final LedgerTransactionRepository transactionRepo;
    private final SpendingCategoryRepository categoryRepo;
    private final GrantAllocationRepository grantRepo;
    private final BudgetAlertRepository alertRepo;
    private final BudgetRepository budgetRepo;
    private final ExchangeRateCacheRepository exchangeRateRepo;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ISO_LOCAL_DATE;

    // ── Transactions ─────────────────────────────────────────────────────

    @Transactional
    public TransactionResponse createTransaction(Long userId, CreateTransactionRequest req) {
        SpendingCategory category = null;
        if (req.getCategoryId() != null) {
            category = categoryRepo.findById(req.getCategoryId()).orElse(null);
        }

        String currency = req.getCurrency() != null ? req.getCurrency() : "EUR";
        BigDecimal amount = req.getAmount() != null ? req.getAmount() : BigDecimal.ZERO;
        BigDecimal amountBase = convertToBaseCurrency(amount, currency, "EUR");

        String txDate = req.getTransactionDate();
        LocalDate parsedDate;
        try {
            parsedDate = txDate != null ? LocalDate.parse(txDate, DATE_FMT) : LocalDate.now();
        } catch (Exception e) {
            parsedDate = LocalDate.now();
        }

        LedgerTransaction tx = LedgerTransaction.builder()
                .userId(userId)
                .amount(amount)
                .currency(currency)
                .amountInBaseCurrency(amountBase)
                .transactionType(req.getTransactionType() != null ? req.getTransactionType() : "EXPENSE")
                .category(category)
                .description(req.getDescription())
                .transactionDate(parsedDate)
                .build();

        tx = transactionRepo.save(tx);
        checkBudgetAlerts(userId);
        return toTransactionResponse(tx);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactions(Long userId) {
        return transactionRepo.findByUserIdOrderByTransactionDateDesc(userId)
                .stream().map(this::toTransactionResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByDateRange(Long userId, String start, String end) {
        LocalDate s = LocalDate.parse(start, DATE_FMT);
        LocalDate e = LocalDate.parse(end, DATE_FMT);
        return transactionRepo.findByUserIdAndTransactionDateBetween(userId, s, e)
                .stream().map(this::toTransactionResponse).toList();
    }

    @Transactional
    public TransactionResponse updateTransaction(Long transactionId, Long userId, CreateTransactionRequest req) {
        LedgerTransaction tx = transactionRepo.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        if (!tx.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: Cannot update transaction of another user");
        }

        if (req.getCategoryId() != null) {
            SpendingCategory category = categoryRepo.findById(req.getCategoryId()).orElse(null);
            tx.setCategory(category);
        }
        if (req.getAmount() != null) {
            String currency = req.getCurrency() != null ? req.getCurrency() : tx.getCurrency();
            tx.setAmount(req.getAmount());
            tx.setCurrency(currency);
            tx.setAmountInBaseCurrency(convertToBaseCurrency(req.getAmount(), currency, "EUR"));
        }
        if (req.getTransactionType() != null) tx.setTransactionType(req.getTransactionType());
        if (req.getDescription() != null) tx.setDescription(req.getDescription());
        if (req.getTransactionDate() != null) {
            try {
                tx.setTransactionDate(LocalDate.parse(req.getTransactionDate(), DATE_FMT));
            } catch (Exception ignored) {}
        }

        tx = transactionRepo.save(tx);
        return toTransactionResponse(tx);
    }

    @Transactional
    public void deleteTransaction(Long transactionId, Long userId) {
        LedgerTransaction tx = transactionRepo.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        if (!tx.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: Cannot delete transaction of another user");
        }
        transactionRepo.deleteById(transactionId);
        log.info("Transaction {} deleted by user {}", transactionId, userId);
    }

    // ── Summary ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public FinancialSummaryResponse getSummary(Long userId) {
        List<GrantAllocation> grants = grantRepo.findByUserId(userId);
        BigDecimal totalBudget = grants.stream()
                .map(GrantAllocation::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSpent = transactionRepo.totalExpenses(userId);
        if (totalSpent == null) totalSpent = BigDecimal.ZERO;

        BigDecimal totalIncomeFromTx = transactionRepo.totalIncome(userId);
        if (totalIncomeFromTx == null) totalIncomeFromTx = BigDecimal.ZERO;

        // Total income = grants + income transactions
        BigDecimal totalIncome = totalBudget.add(totalIncomeFromTx);
        BigDecimal remaining = totalIncome.subtract(totalSpent);

        // Burn rate: total spent / days since first grant
        BigDecimal burnRate = BigDecimal.ZERO;
        int daysLeft = 0;
        if (!grants.isEmpty() && totalSpent.compareTo(BigDecimal.ZERO) > 0) {
            LocalDate earliest = grants.stream()
                    .map(GrantAllocation::getMobilityStartDate)
                    .min(LocalDate::compareTo)
                    .orElse(LocalDate.now());
            long daysSinceStart = ChronoUnit.DAYS.between(earliest, LocalDate.now());
            if (daysSinceStart > 0) {
                burnRate = totalSpent.divide(BigDecimal.valueOf(daysSinceStart), 2, RoundingMode.HALF_UP);
                if (burnRate.compareTo(BigDecimal.ZERO) > 0) {
                    daysLeft = remaining.divide(burnRate, 0, RoundingMode.FLOOR).intValue();
                }
            }
        }

        // Spending by category
        List<LedgerTransaction> allTx = transactionRepo.findByUserIdOrderByTransactionDateDesc(userId);
        Map<String, BigDecimal> byCategory = allTx.stream()
                .filter(t -> "EXPENSE".equals(t.getTransactionType()) && t.getCategory() != null)
                .collect(Collectors.groupingBy(
                        t -> t.getCategory().getName(),
                        LinkedHashMap::new,
                        Collectors.reducing(BigDecimal.ZERO,
                                LedgerTransaction::getAmountInBaseCurrency, BigDecimal::add)));

        List<BudgetAlert> unread = alertRepo.findByUserIdAndIsAcknowledgedFalseOrderByCreatedAtDesc(userId);
        List<FinancialSummaryResponse.AlertItem> alertItems = unread.stream()
                .map(a -> {
                    return FinancialSummaryResponse.AlertItem.builder()
                        .id(a.getId())
                        .alertType(a.getAlertType().name())
                        .message(a.getMessage())
                        .acknowledged(a.getIsAcknowledged())
                        .createdAt(a.getCreatedAt().toString())
                        .build();
                })
                .toList();

        return FinancialSummaryResponse.builder()
                .totalBudget(totalBudget)
                .totalSpent(totalSpent)
                .remaining(remaining)
                .totalIncome(totalIncome)
                .totalExpenses(totalSpent)
                .balance(remaining)
                .burnRatePerDay(burnRate)
                .estimatedDaysLeft(daysLeft)
                .baseCurrency("EUR")
                .spendingByCategory(byCategory)
                .alerts(alertItems)
                .build();
    }

    // ── Grants ───────────────────────────────────────────────────────────

    @Transactional
    public GrantResponse createGrant(Long userId, CreateGrantRequest req) {
        if (req.getSourceName() == null || req.getSourceName().isEmpty()) {
            throw new IllegalArgumentException("Grant source name is required");
        }
        if (req.getTotalAmount() == null || req.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Grant total amount must be greater than 0");
        }

        GrantAllocation grant = GrantAllocation.builder()
                .userId(userId)
                .sourceName(req.getSourceName())
                .totalAmount(req.getTotalAmount())
                .currency("EUR")
                .mobilityStartDate(req.getStartDate() != null ? req.getStartDate() : LocalDate.now())
                .mobilityEndDate(req.getEndDate() != null ? req.getEndDate() : LocalDate.now().plusYears(1))
                .notes(req.getNotes())
                .build();

        grant = grantRepo.save(grant);
        log.info("Grant created for user {} with id {}", userId, grant.getId());

        return GrantResponse.builder()
                .id(grant.getId())
                .sourceName(grant.getSourceName())
                .totalAmount(grant.getTotalAmount())
                .disbursedAmount(req.getDisbursedAmount() != null ? req.getDisbursedAmount() : BigDecimal.ZERO)
                .currency(grant.getCurrency())
                .mobilityStartDate(grant.getMobilityStartDate().toString())
                .mobilityEndDate(grant.getMobilityEndDate() != null ? grant.getMobilityEndDate().toString() : null)
                .createdAt(grant.getCreatedAt().toString())
                .build();
    }

    @Transactional(readOnly = true)
    public List<GrantResponse> getGrants(Long userId) {
        return grantRepo.findByUserId(userId).stream()
                .map(g -> {
                    return GrantResponse.builder()
                        .id(g.getId())
                        .sourceName(g.getSourceName())
                        .totalAmount(g.getTotalAmount())
                        .disbursedAmount(BigDecimal.ZERO)
                        .currency(g.getCurrency())
                        .mobilityStartDate(g.getMobilityStartDate().toString())
                        .mobilityEndDate(g.getMobilityEndDate() != null ? g.getMobilityEndDate().toString() : null)
                        .createdAt(g.getCreatedAt().toString())
                        .build();
                })
                .toList();
    }

    @Transactional
    public GrantResponse updateGrant(Long grantId, Long userId, UpdateGrantRequest req) {
        GrantAllocation grant = grantRepo.findById(grantId)
                .orElseThrow(() -> new RuntimeException("Grant not found"));
        
        if (!grant.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: Cannot update grant of another user");
        }

        if (req.getSourceName() != null) grant.setSourceName(req.getSourceName());
        if (req.getTotalAmount() != null) grant.setTotalAmount(req.getTotalAmount());
        if (req.getStartDate() != null) grant.setMobilityStartDate(req.getStartDate());
        if (req.getEndDate() != null) grant.setMobilityEndDate(req.getEndDate());
        if (req.getNotes() != null) grant.setNotes(req.getNotes());

        grant = grantRepo.save(grant);
        log.info("Grant {} updated by user {}", grantId, userId);

        return GrantResponse.builder()
                .id(grant.getId())
                .sourceName(grant.getSourceName())
                .totalAmount(grant.getTotalAmount())
                .disbursedAmount(req.getDisbursedAmount() != null ? req.getDisbursedAmount() : BigDecimal.ZERO)
                .currency(grant.getCurrency())
                .mobilityStartDate(grant.getMobilityStartDate().toString())
                .mobilityEndDate(grant.getMobilityEndDate() != null ? grant.getMobilityEndDate().toString() : null)
                .createdAt(grant.getCreatedAt().toString())
                .build();
    }

    @Transactional
    public void deleteGrant(Long grantId, Long userId) {
        GrantAllocation grant = grantRepo.findById(grantId)
                .orElseThrow(() -> new RuntimeException("Grant not found"));
        
        if (!grant.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: Cannot delete grant of another user");
        }
        
        grantRepo.deleteById(grantId);
        log.info("Grant {} deleted by user {}", grantId, userId);
    }

    // ── Alerts ───────────────────────────────────────────────────────────

    @Transactional
    public void acknowledgeAlert(Long alertId, Long userId) {
        BudgetAlert alert = alertRepo.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        alert.setIsAcknowledged(true);
        alertRepo.save(alert);
    }

    // ── Categories ──────────────────────────────────────────────────────

    public List<SpendingCategoryResponse> getSpendingCategories() {
        return categoryRepo.findAll().stream()
                .map(c -> SpendingCategoryResponse.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .icon(c.getIcon())
                        .color(null)
                        .build())
                .toList();
    }

    // ── Budgets ─────────────────────────────────────────────────────────

    @Transactional
    public BudgetResponse createBudget(Long userId, CreateBudgetRequest req) {
        if (req.getCategoryId() == null) {
            throw new IllegalArgumentException("Category ID is required");
        }
        if (req.getLimitAmount() == null || req.getLimitAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Budget limit amount must be greater than 0");
        }

        SpendingCategory category = categoryRepo.findById(req.getCategoryId()).orElse(null);
        String categoryName = category != null ? category.getName() : "Unknown";

        Budget budget = Budget.builder()
                .userId(userId)
                .categoryId(req.getCategoryId())
                .limitAmount(req.getLimitAmount())
                .cycle(req.getCycle() != null ? req.getCycle() : "MONTHLY")
                .build();

        budget = budgetRepo.save(budget);
        log.info("Budget created for user {} with id {}", userId, budget.getId());

        return BudgetResponse.builder()
                .id(budget.getId())
                .categoryId(budget.getCategoryId())
                .categoryName(categoryName)
                .limitAmount(budget.getLimitAmount())
                .spent(BigDecimal.ZERO)
                .progress(0.0)
                .cycle(budget.getCycle())
                .createdAt(budget.getCreatedAt().toString())
                .build();
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgets(Long userId) {
        return budgetRepo.findByUserId(userId).stream()
                .map(b -> {
                    SpendingCategory cat = categoryRepo.findById(b.getCategoryId()).orElse(null);
                    String categoryName = cat != null ? cat.getName() : "Unknown";
                    return BudgetResponse.builder()
                            .id(b.getId())
                            .categoryId(b.getCategoryId())
                            .categoryName(categoryName)
                            .limitAmount(b.getLimitAmount())
                            .spent(BigDecimal.ZERO)
                            .progress(0.0)
                            .cycle(b.getCycle())
                            .createdAt(b.getCreatedAt().toString())
                            .build();
                })
                .toList();
    }

    @Transactional
    public BudgetResponse updateBudget(Long budgetId, Long userId, UpdateBudgetRequest req) {
        Budget budget = budgetRepo.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        
        if (!budget.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: Cannot update budget of another user");
        }

        if (req.getCategoryId() != null) budget.setCategoryId(req.getCategoryId());
        if (req.getLimitAmount() != null) budget.setLimitAmount(req.getLimitAmount());
        if (req.getCycle() != null) budget.setCycle(req.getCycle());
        if (req.getNotes() != null) budget.setNotes(req.getNotes());

        budget = budgetRepo.save(budget);
        log.info("Budget {} updated by user {}", budgetId, userId);

        SpendingCategory cat = categoryRepo.findById(budget.getCategoryId()).orElse(null);
        String categoryName = cat != null ? cat.getName() : "Unknown";

        return BudgetResponse.builder()
                .id(budget.getId())
                .categoryId(budget.getCategoryId())
                .categoryName(categoryName)
                .limitAmount(budget.getLimitAmount())
                .spent(BigDecimal.ZERO)
                .progress(0.0)
                .cycle(budget.getCycle())
                .createdAt(budget.getCreatedAt().toString())
                .build();
    }

    @Transactional
    public void deleteBudget(Long budgetId, Long userId) {
        Budget budget = budgetRepo.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        
        if (!budget.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: Cannot delete budget of another user");
        }
        
        budgetRepo.deleteById(budgetId);
        log.info("Budget {} deleted by user {}", budgetId, userId);
    }

    // ── Private helpers ──────────────────────────────────────────────────

    private void checkBudgetAlerts(Long userId) {
        BigDecimal spent7d = transactionRepo.sumExpensesSince(userId, LocalDate.now().minusDays(7));
        BigDecimal spent14d = transactionRepo.sumExpensesSince(userId, LocalDate.now().minusDays(14));

        List<GrantAllocation> grants = grantRepo.findByUserId(userId);
        BigDecimal totalBudget = grants.stream()
                .map(GrantAllocation::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalBudget.compareTo(BigDecimal.ZERO) == 0) return;

        BigDecimal totalSpent = transactionRepo.totalExpenses(userId);
        if (totalSpent == null) totalSpent = BigDecimal.ZERO;
        BigDecimal remaining = totalBudget.subtract(totalSpent);

        // High burn rate in last 7 days
        if (spent7d != null && spent7d.compareTo(totalBudget.multiply(BigDecimal.valueOf(0.15))) > 0) {
            createAlert(userId, com.eramix.entity.enums.BudgetAlertType.HIGH_BURN_RATE,
                    "You've spent " + spent7d + "€ in the last 7 days, which is over 15% of your total budget.");
        }

        // Accelerating spend: 14-day spend exceeds 40% of total budget
        if (spent14d != null && spent14d.compareTo(totalBudget.multiply(BigDecimal.valueOf(0.40))) > 0) {
            createAlert(userId, com.eramix.entity.enums.BudgetAlertType.HIGH_BURN_RATE,
                    "You've spent " + spent14d + "€ in the last 14 days, which is over 40% of your total budget.");
        }

        // Low funds
        if (remaining.compareTo(totalBudget.multiply(BigDecimal.valueOf(0.1))) < 0) {
            createAlert(userId, com.eramix.entity.enums.BudgetAlertType.LOW_FUNDS_7_DAYS,
                    "Your remaining budget (" + remaining + "€) is below 10% of your total allocation.");
        }
    }

    private void createAlert(Long userId, com.eramix.entity.enums.BudgetAlertType type, String message) {
        BudgetAlert alert = BudgetAlert.builder()
                .userId(userId)
                .alertType(type)
                .message(message)
                .isAcknowledged(false)
                .build();
        alertRepo.save(alert);
    }

    @Transactional
    public void checkAndCreateBudgetAlerts(Long userId) {
        List<Budget> budgets = budgetRepo.findByUserId(userId);
        
        for (Budget budget : budgets) {
            BigDecimal spent = transactionRepo.findByUserIdAndCategoryId(userId, budget.getCategoryId())
                    .stream()
                    .filter(tx -> "EXPENSE".equals(tx.getTransactionType()))
                    .map(LedgerTransaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            double progress = budget.getLimitAmount().compareTo(BigDecimal.ZERO) > 0
                    ? (spent.doubleValue() / budget.getLimitAmount().doubleValue()) * 100
                    : 0;

            // Check if alert should be created
            if (progress >= 75.0 && progress < 100.0) {
                // Check if warning already exists
                boolean warningExists = alertRepo.existsByBudgetIdAndAlertLevel(budget.getId(), "WARNING");
                if (!warningExists) {
                    SpendingCategory cat = categoryRepo.findById(budget.getCategoryId()).orElse(null);
                    String categoryName = cat != null ? cat.getName() : "Unknown";
                    
                    BudgetAlert alert = BudgetAlert.builder()
                            .userId(userId)
                            .budgetId(budget.getId())
                            .alertType(BudgetAlertType.APPROACHING_LIMIT)
                            .message("Has alcanzado el 75% de tu presupuesto de " + categoryName)
                            .spentAmount(spent)
                            .limitAmount(budget.getLimitAmount())
                            .progressPercentage(progress)
                            .alertLevel("WARNING")
                            .isAcknowledged(false)
                            .build();
                    alertRepo.save(alert);
                }
            } else if (progress >= 100.0) {
                // Check if critical already exists
                boolean criticalExists = alertRepo.existsByBudgetIdAndAlertLevel(budget.getId(), "CRITICAL");
                if (!criticalExists) {
                    SpendingCategory cat = categoryRepo.findById(budget.getCategoryId()).orElse(null);
                    String categoryName = cat != null ? cat.getName() : "Unknown";
                    
                    BudgetAlert alert = BudgetAlert.builder()
                            .userId(userId)
                            .budgetId(budget.getId())
                            .alertType(BudgetAlertType.EXCEEDED_LIMIT)
                            .message("Has excedido tu presupuesto de " + categoryName)
                            .spentAmount(spent)
                            .limitAmount(budget.getLimitAmount())
                            .progressPercentage(progress)
                            .alertLevel("CRITICAL")
                            .isAcknowledged(false)
                            .build();
                    alertRepo.save(alert);
                }
            }
        }
    }

    @Transactional(readOnly = true)
    public List<BudgetAlertResponse> getBudgetAlerts(Long userId) {
        return alertRepo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(a -> {
                    Budget budget = budgetRepo.findById(a.getBudgetId()).orElse(null);
                    String categoryName = "Unknown";
                    if (budget != null) {
                        SpendingCategory cat = categoryRepo.findById(budget.getCategoryId()).orElse(null);
                        categoryName = cat != null ? cat.getName() : "Unknown";
                    }
                    return BudgetAlertResponse.builder()
                            .id(a.getId())
                            .budgetId(a.getBudgetId())
                            .categoryName(categoryName)
                            .message(a.getMessage())
                            .spent(a.getSpentAmount() != null ? a.getSpentAmount() : BigDecimal.ZERO)
                            .limit(a.getLimitAmount() != null ? a.getLimitAmount() : BigDecimal.ZERO)
                            .progress(a.getProgressPercentage() != null ? a.getProgressPercentage() : 0.0)
                            .alertLevel(a.getAlertLevel())
                            .isAcknowledged(a.getIsAcknowledged())
                            .createdAt(a.getCreatedAt().toString())
                            .build();
                })
                .toList();
    }

    public Long getPendingAlertsCount(Long userId) {
        return alertRepo.countByUserIdAndIsAcknowledgedFalse(userId);
    }

    private BigDecimal convertToBaseCurrency(BigDecimal amount, String from, String to) {
        if (from == null || from.equals(to)) return amount;
        return exchangeRateRepo.findByBaseCurrencyAndTargetCurrency(from, to)
                .map(rate -> amount.multiply(rate.getRate()).setScale(2, RoundingMode.HALF_UP))
                .orElse(amount);
    }

    private TransactionResponse toTransactionResponse(LedgerTransaction tx) {
        return TransactionResponse.builder()
                .id(tx.getId())
                .amount(tx.getAmount())
                .currency(tx.getCurrency())
                .amountInBaseCurrency(tx.getAmountInBaseCurrency())
                .transactionType(tx.getTransactionType())
                .categoryId(tx.getCategory() != null ? tx.getCategory().getId() : null)
                .categoryName(tx.getCategory() != null ? tx.getCategory().getName() : null)
                .categoryIcon(tx.getCategory() != null ? tx.getCategory().getIcon() : null)
                .description(tx.getDescription())
                .transactionDate(tx.getTransactionDate().toString())
                .createdAt(tx.getCreatedAt().toString())
                .build();
    }
}
