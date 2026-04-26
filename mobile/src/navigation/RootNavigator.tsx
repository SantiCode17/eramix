import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import { NetworkStatusBanner } from "@/design-system";
import { EramixToastProvider } from "@/components/EramixToast";
import type { RootStackParamList } from "@/types";

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator(): React.JSX.Element {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const initialize = useAuthStore((s) => s.initialize);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user?.id) {
      useChatStore.getState().initialize(user.id);
    } else {
      useChatStore.getState().teardown();
    }
  }, [user?.id]);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        await initialize();
      } finally {
        if (!isMounted) return;
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, [initialize]);

  if (!isInitialized) {
    return <View style={StyleSheet.absoluteFill} />;
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: "transparent" },
          }}
        >
          {isAuthenticated ? (
            <Stack.Screen
              name="Main"
              component={MainNavigator}
              options={{ animation: "fade" }}
            />
          ) : (
            <Stack.Screen
              name="Auth"
              component={AuthNavigator}
              options={{ animation: "fade" }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      {isAuthenticated && <NetworkStatusBanner />}
      <EramixToastProvider />
    </View>
  );
}
