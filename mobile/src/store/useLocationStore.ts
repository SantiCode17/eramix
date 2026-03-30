import { create } from "zustand";
import * as Location from "expo-location";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  permissionStatus: Location.PermissionStatus | null;
  loading: boolean;
  error: string | null;

  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<void>;
  setLocation: (lat: number, lon: number) => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  latitude: null,
  longitude: null,
  permissionStatus: null,
  loading: false,
  error: null,

  requestPermission: async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      set({ permissionStatus: status });
      return status === Location.PermissionStatus.GRANTED;
    } catch (err) {
      set({ error: "No se pudo solicitar permiso de ubicación" });
      return false;
    }
  },

  getCurrentLocation: async () => {
    const state = get();
    if (state.loading) return;

    set({ loading: true, error: null });

    try {
      // Check permission first
      if (state.permissionStatus !== Location.PermissionStatus.GRANTED) {
        const granted = await get().requestPermission();
        if (!granted) {
          set({ loading: false, error: "Permiso de ubicación denegado" });
          return;
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      set({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error: "No se pudo obtener la ubicación",
      });
    }
  },

  setLocation: (lat, lon) => {
    set({ latitude: lat, longitude: lon });
  },
}));
