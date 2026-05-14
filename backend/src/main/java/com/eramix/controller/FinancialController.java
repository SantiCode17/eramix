package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.finance.*;
import com.eramix.entity.User;
import com.eramix.repository.UserRepository;
import com.eramix.service.FinancialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/finance")
@RequiredArgsConstructor
public class FinancialController {

    private final FinancialService financialService;
    private final UserRepository userRepository;

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @PostMapping("/transactions")
    public ResponseEntity<ApiResponse<TransactionResponse>> createTransaction(
            @RequestBody CreateTransactionRequest req) {
        TransactionResponse transaction = financialService.createTransaction(currentUserId(), req);
        // Check and create budget alerts after transaction is created
        financialService.checkAndCreateBudgetAlerts(currentUserId());
        return ResponseEntity.ok(ApiResponse.ok(transaction));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getTransactions(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        if (startDate != null && endDate != null) {
            return ResponseEntity.ok(ApiResponse.ok(
                    financialService.getTransactionsByDateRange(currentUserId(), startDate, endDate)));
        }
        return ResponseEntity.ok(ApiResponse.ok(
                financialService.getTransactions(currentUserId())));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<FinancialSummaryResponse>> getSummary() {
        return ResponseEntity.ok(ApiResponse.ok(
                financialService.getSummary(currentUserId())));
    }

    @PutMapping("/transactions/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> updateTransaction(
            @PathVariable Long id,
            @RequestBody CreateTransactionRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                financialService.updateTransaction(id, currentUserId(), req)));
    }

    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(@PathVariable Long id) {
        financialService.deleteTransaction(id, currentUserId());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/grants")
    public ResponseEntity<ApiResponse<List<GrantResponse>>> getGrants() {
        return ResponseEntity.ok(ApiResponse.ok(
                financialService.getGrants(currentUserId())));
    }

    @PostMapping("/grants")
    public ResponseEntity<ApiResponse<GrantResponse>> createGrant(
            @RequestBody CreateGrantRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                financialService.createGrant(currentUserId(), req)));
    }

    @PutMapping("/grants/{id}")
    public ResponseEntity<ApiResponse<GrantResponse>> updateGrant(
            @PathVariable Long id,
            @RequestBody UpdateGrantRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                financialService.updateGrant(id, currentUserId(), req)));
    }

    @DeleteMapping("/grants/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGrant(@PathVariable Long id) {
        financialService.deleteGrant(id, currentUserId());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/budget-alerts")
    public ResponseEntity<ApiResponse<List<BudgetAlertResponse>>> getBudgetAlerts() {
        return ResponseEntity.ok(ApiResponse.ok(
                financialService.getBudgetAlerts(currentUserId())));
    }

    @GetMapping("/budget-alerts/pending-count")
    public ResponseEntity<ApiResponse<Long>> getPendingAlertsCount() {
        return ResponseEntity.ok(ApiResponse.ok(
                financialService.getPendingAlertsCount(currentUserId())));
    }

    @PutMapping("/alerts/{id}/acknowledge")
    public ResponseEntity<ApiResponse<Void>> acknowledgeAlert(@PathVariable Long id) {
        financialService.acknowledgeAlert(id, currentUserId());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<SpendingCategoryResponse>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(
                financialService.getSpendingCategories()));
    }

    @GetMapping("/budgets")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgets() {
        return ResponseEntity.ok(ApiResponse.ok(
                financialService.getBudgets(currentUserId())));
    }

    @PostMapping("/budgets")
    public ResponseEntity<ApiResponse<BudgetResponse>> createBudget(
            @RequestBody CreateBudgetRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                financialService.createBudget(currentUserId(), req)));
    }

    @PutMapping("/budgets/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateBudget(
            @PathVariable Long id,
            @RequestBody UpdateBudgetRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                financialService.updateBudget(id, currentUserId(), req)));
    }

    @DeleteMapping("/budgets/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(@PathVariable Long id) {
        financialService.deleteBudget(id, currentUserId());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    // ── Finance Settings ──────────────────────────────────────────────────

    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<FinanceSettingsDto>> getFinanceSettings() {
        User user = userRepository.findById(currentUserId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        FinanceSettingsDto dto = new FinanceSettingsDto(
                Boolean.TRUE.equals(user.getNotificationsEnabled()),
                Boolean.TRUE.equals(user.getBudgetAlertsEnabled()),
                user.getBudgetAlertThreshold() != null ? user.getBudgetAlertThreshold() : 75
        );
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PutMapping("/settings")
    public ResponseEntity<ApiResponse<FinanceSettingsDto>> updateFinanceSettings(
            @RequestBody FinanceSettingsDto req) {
        User user = userRepository.findById(currentUserId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        if (req.enableNotifications() != null) user.setNotificationsEnabled(req.enableNotifications());
        if (req.enableBudgetAlerts() != null) user.setBudgetAlertsEnabled(req.enableBudgetAlerts());
        if (req.alertThreshold() != null) user.setBudgetAlertThreshold(req.alertThreshold());
        userRepository.save(user);
        FinanceSettingsDto dto = new FinanceSettingsDto(
                user.getNotificationsEnabled(),
                user.getBudgetAlertsEnabled(),
                user.getBudgetAlertThreshold()
        );
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }
}
