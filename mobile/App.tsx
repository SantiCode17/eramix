import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RootNavigator } from "@/navigation";
import { useAppFonts } from "@/design-system/fonts";
import { initializeNotifications, setupNotificationResponseListener } from "@/services/notificationService";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Axios interceptor handles retries with circuit breaker
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

/* ── Error Boundary ──────────────────────────────── */
interface EBState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  EBState
> {
  state: EBState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.loading}>
          <Text style={{ color: "#FF4444", fontSize: 18, marginBottom: 12 }}>
            Error en la app
          </Text>
          <Text
            style={{
              color: "#FFCC00",
              fontSize: 13,
              textAlign: "center",
              paddingHorizontal: 20,
            }}
          >
            {this.state.error?.message ?? "Error desconocido"}
          </Text>
          <Text
            style={{
              color: "#888",
              fontSize: 11,
              textAlign: "center",
              paddingHorizontal: 20,
              marginTop: 8,
            }}
          >
            {this.state.error?.stack?.slice(0, 500)}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

/* ── App ─────────────────────────────────────────── */
export default function App(): React.JSX.Element {
  const { loaded: fontsLoaded } = useAppFonts();

  React.useEffect(() => {
    // Initialize notifications
    const initNotifications = async () => {
      await initializeNotifications();
    };
    initNotifications();

    // Setup notification response listener
    const removeListener = setupNotificationResponseListener((data) => {
      console.log("[App] Notification pressed:", data);
      // Navigation can be handled here if needed
    });

    return () => removeListener();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFCC00" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <StatusBar style="light" translucent backgroundColor="transparent" />
            <RootNavigator />
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A2E",
  },
});
