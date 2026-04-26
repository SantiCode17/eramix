/**
 * ────────────────────────────────────────────────────────
 *  TicketingNavigator — Stack de tickets
 * ────────────────────────────────────────────────────────
 */

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { TicketingHomeScreen, MyTicketsScreen } from "@/screens/ticketing";
import type { TicketingStackParamList } from "@/types/ticketing";

const Stack = createStackNavigator<TicketingStackParamList>();

export default function TicketingNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TicketingHome" component={TicketingHomeScreen} />
      <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
    </Stack.Navigator>
  );
}
