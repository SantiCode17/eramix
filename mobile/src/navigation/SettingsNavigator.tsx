import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
  SettingsScreen,
  PrivacySettingsScreen,
  NotificationSettingsScreen,
  BlockedUsersScreen,
  DeleteAccountScreen,
} from "@/screens/settings";
import type { SettingsStackParamList } from "@/types";

const Stack = createStackNavigator<SettingsStackParamList>();

export default function SettingsNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "transparent" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
      />
      <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
    </Stack.Navigator>
  );
}
