import { create } from "zustand";
import { financeApi } from "@/api";
import type {
  FinancialSummary,
  LedgerTransaction,
  CreateTransactionRequest,
} from "@/types";

interface FinanceState {
  summary: FinancialSummary | null;
  transactions: LedgerTransaction[];
  loading: boolean;
  error: string | null;

  fetchSummary: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  addTransaction: (data: CreateTransactionRequest) => Promise<void>;
  reset: () => void;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  summary: null,
  transactions: [],
  loading: false,
  error: null,

  fetchSummary: async () => {
    set({ loading: true, error: null });
    try {
      const summary = await financeApi.getFinancialSummary();
      set({ summary, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Error", loading: false });
    }
  },

  fetchTransactions: async () => {
    set({ loading: true, error: null });
    try {
      const transactions = await financeApi.getTransactions();
      set({ transactions, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Error", loading: false });
    }
  },

  addTransaction: async (data: CreateTransactionRequest) => {
    const tx = await financeApi.createTransaction(data);
    set((s) => ({
      transactions: [tx, ...s.transactions],
    }));
  },

  reset: () =>
    set({ summary: null, transactions: [], loading: false, error: null }),
}));
