/**
 * ────────────────────────────────────────────────────────
 *  financeService.ts — API para módulo financiero
 * ────────────────────────────────────────────────────────
 */

import { apiClient } from "./client";
import type {
  LedgerTransaction,
  FinancialSummary,
  GrantAllocation,
  CreateTransactionRequest,
  SpendingCategory,
  CreateGrantRequest,
  UpdateGrantRequest,
  Budget,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  BudgetAlertResponse,
} from "@/types/finance";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── Transactions ────────────────────────────────────

export async function createTransaction(
  body: CreateTransactionRequest,
): Promise<LedgerTransaction> {
  const { data } = await apiClient.post<ApiResponse<LedgerTransaction>>(
    "/v1/finance/transactions",
    body,
  );
  return data.data;
}

export async function getTransactions(): Promise<LedgerTransaction[]> {
  const { data } = await apiClient.get<ApiResponse<LedgerTransaction[]>>(
    "/v1/finance/transactions",
  );
  return data.data;
}

export async function updateTransaction(
  transactionId: number,
  body: Partial<CreateTransactionRequest>,
): Promise<LedgerTransaction> {
  const { data } = await apiClient.put<ApiResponse<LedgerTransaction>>(
    `/v1/finance/transactions/${transactionId}`,
    body,
  );
  return data.data;
}

export async function deleteTransaction(transactionId: number): Promise<void> {
  await apiClient.delete(`/v1/finance/transactions/${transactionId}`);
}

// ── Summary ─────────────────────────────────────────

export async function getFinancialSummary(): Promise<FinancialSummary> {
  const { data } = await apiClient.get<ApiResponse<FinancialSummary>>(
    "/v1/finance/summary",
  );
  return data.data;
}

// ── Grants ──────────────────────────────────────────

export async function getGrants(): Promise<GrantAllocation[]> {
  const { data } = await apiClient.get<ApiResponse<GrantAllocation[]>>(
    "/v1/finance/grants",
  );
  return data.data;
}

export async function createGrant(body: CreateGrantRequest): Promise<GrantAllocation> {
  const { data } = await apiClient.post<ApiResponse<GrantAllocation>>(
    "/v1/finance/grants",
    body,
  );
  return data.data;
}

export async function updateGrant(grantId: number, body: CreateGrantRequest): Promise<GrantAllocation> {
  const { data } = await apiClient.put<ApiResponse<GrantAllocation>>(
    `/v1/finance/grants/${grantId}`,
    body,
  );
  return data.data;
}

export async function deleteGrant(grantId: number): Promise<void> {
  await apiClient.delete(`/v1/finance/grants/${grantId}`);
}

// ── Budgets ─────────────────────────────────────────

export async function getBudgets(): Promise<Budget[]> {
  const { data } = await apiClient.get<ApiResponse<Budget[]>>(
    "/v1/finance/budgets",
  );
  return data.data;
}

export async function createBudget(body: CreateBudgetRequest): Promise<Budget> {
  const { data } = await apiClient.post<ApiResponse<Budget>>(
    "/v1/finance/budgets",
    body,
  );
  return data.data;
}

export async function updateBudget(budgetId: number, body: CreateBudgetRequest): Promise<Budget> {
  const { data } = await apiClient.put<ApiResponse<Budget>>(
    `/v1/finance/budgets/${budgetId}`,
    body,
  );
  return data.data;
}

export async function deleteBudget(budgetId: number): Promise<void> {
  await apiClient.delete(`/v1/finance/budgets/${budgetId}`);
}

// ── Alerts ──────────────────────────────────────────

export async function getBudgetAlerts(): Promise<BudgetAlertResponse[]> {
  const { data } = await apiClient.get<ApiResponse<BudgetAlertResponse[]>>(
    "/v1/finance/budget-alerts",
  );
  return data.data;
}

export async function getPendingAlertsCount(): Promise<number> {
  const { data } = await apiClient.get<ApiResponse<number>>(
    "/v1/finance/budget-alerts/pending-count",
  );
  return data.data;
}

export async function acknowledgeAlert(alertId: number): Promise<void> {
  await apiClient.put(`/v1/finance/alerts/${alertId}/acknowledge`);
}

// ── Categories ──────────────────────────────────────

export async function getSpendingCategories(): Promise<SpendingCategory[]> {
  const { data } = await apiClient.get<ApiResponse<SpendingCategory[]>>(
    "/v1/finance/categories",
  );
  return data.data;
}

export const financeApi = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getFinancialSummary,
  getGrants,
  createGrant,
  updateGrant,
  deleteGrant,
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetAlerts,
  getPendingAlertsCount,
  acknowledgeAlert,
  getSpendingCategories,
};
