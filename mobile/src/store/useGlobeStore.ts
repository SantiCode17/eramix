import { create } from "zustand";
import { fetchCountryStats } from "@/api/globe";
import type { CountryStats, CountryPin } from "@/types/globe";

interface GlobeState {
  countryPins: CountryPin[];
  selectedCountry: CountryPin | null;
  loading: boolean;
  error: string | null;

  fetchStats: () => Promise<void>;
  selectCountry: (pin: CountryPin | null) => void;
  clearSelection: () => void;
}

export const useGlobeStore = create<GlobeState>((set) => ({
  countryPins: [],
  selectedCountry: null,
  loading: false,
  error: null,

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const stats = await fetchCountryStats();
      const pins: CountryPin[] = stats.map((s) => ({
        country: s.country,
        latitude: s.latitude,
        longitude: s.longitude,
        studentCount: s.studentCount,
        universities: s.universities,
      }));
      set({ countryPins: pins, loading: false });
    } catch (e: any) {
      set({
        error: e?.message ?? "Error al cargar datos del globo",
        loading: false,
      });
    }
  },

  selectCountry: (pin) => set({ selectedCountry: pin }),
  clearSelection: () => set({ selectedCountry: null }),
}));
