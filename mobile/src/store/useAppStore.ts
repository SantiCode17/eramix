import { create } from "zustand";

interface AppState {
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  setAuthenticated: (value: boolean) => void;
  setOnboardingComplete: (value: boolean) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  isOnboardingComplete: false,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setOnboardingComplete: (value) => set({ isOnboardingComplete: value }),
  reset: () => set({ isAuthenticated: false, isOnboardingComplete: false }),
}));
