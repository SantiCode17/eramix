/**
 * ────────────────────────────────────────────────────────
 *  finance.ts — Types para módulo financiero
 * ────────────────────────────────────────────────────────
 */

export interface LedgerTransaction {
  id: number;
  categoryName: string;
  categoryIcon: string;
  amount: number;
  currency: string;
  transactionType: "INCOME" | "EXPENSE";
  description: string;
  transactionDate: string;
  createdAt: string;
}

export interface SpendingCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface GrantAllocation {
  id: number;
  sourceName: string;
  totalAmount: number;
  disbursedAmount: number;
  currency: string;
  mobilityStartDate: string;
  mobilityEndDate: string;
}

export interface Budget {
  id: number;
  categoryId: number;
  limitAmount: number;
  cycle: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  spent: number;
  progress: number;
}

export interface BudgetAlert {
  id: number;
  alertType: string;
  message: string;
  isAcknowledged: boolean;
  createdAt: string;
}

export interface BudgetAlertResponse {
  id: number;
  budgetId: number;
  categoryName: string;
  spentAmount: number;
  limitAmount: number;
  progressPercentage: number;
  alertLevel: "WARNING" | "CRITICAL";
  isAcknowledged: boolean;
  createdAt: string;
}

export interface FinancialSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  currency: string;
  baseCurrency: string;
  burnRatePerDay: number;
  estimatedDaysLeft: number;
  spendingByCategory: Record<string, number>;
  alerts: BudgetAlert[];
}

export interface CreateTransactionRequest {
  categoryId: number;
  amount: number;
  currency: string;
  transactionType: "INCOME" | "EXPENSE";
  description: string;
  transactionDate: string;
}

export interface CreateGrantRequest {
  sourceName: string;
  totalAmount: number;
  disbursedAmount: number;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface UpdateGrantRequest extends CreateGrantRequest {}

export interface CreateBudgetRequest {
  categoryId: number;
  limitAmount: number;
  cycle: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
}

export interface UpdateBudgetRequest extends CreateBudgetRequest {}

export type FinanceStackParamList = {
  FinanceHome: undefined;
  AddTransaction: undefined;
  TransactionHistory: undefined;
  TransactionDetail: { transaction: LedgerTransaction };
  GrantsOverview: undefined;
  GrantDetail: { grant: GrantAllocation };
  Analytics: undefined;
  Budgets: undefined;
  BudgetAlerts: undefined;
  FinanceSettings: undefined;
};
