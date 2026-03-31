import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
  ExchangeHomeScreen,
  FindPartnerScreen,
  ExchangeRequestsScreen,
  ExchangeSessionDetailScreen,
} from "@/screens/exchange";
import type { ExchangeStackParamList } from "@/types/exchange";

const Stack = createStackNavigator<ExchangeStackParamList>();

export default function ExchangeNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExchangeHome" component={ExchangeHomeScreen} />
      <Stack.Screen name="FindPartner" component={FindPartnerScreen} />
      <Stack.Screen name="ExchangeRequests" component={ExchangeRequestsScreen} />
      <Stack.Screen name="ExchangeSessionDetail" component={ExchangeSessionDetailScreen} />
    </Stack.Navigator>
  );
}
