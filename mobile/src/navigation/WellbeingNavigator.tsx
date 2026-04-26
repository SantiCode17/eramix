/**
 * ────────────────────────────────────────────────────────
 *  WellbeingNavigator — Stack de bienestar/SOS
 * ────────────────────────────────────────────────────────
 */

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
  WellbeingHomeScreen,
  SOSScreen,
  EmergencyContactsScreen,
} from "@/screens/wellbeing";
import type { WellbeingStackParamList } from "@/types/wellbeing";

const Stack = createStackNavigator<WellbeingStackParamList>();

export default function WellbeingNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WellbeingHome" component={WellbeingHomeScreen} />
      <Stack.Screen name="SOSScreen" component={SOSScreen} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
    </Stack.Navigator>
  );
}
