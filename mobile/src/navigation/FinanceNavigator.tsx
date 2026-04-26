/**
 * ────────────────────────────────────────────────────────
 *  FinanceNavigator — Stack de finanzas
 * ────────────────────────────────────────────────────────
 */

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { FinanceHomeScreen, AddTransactionScreen, TransactionHistoryScreen, TransactionDetailScreen, GrantsOverviewScreen, GrantDetailScreen, AnalyticsScreen, BudgetScreen } from "@/screens/finance";
import BudgetAlertsScreen from "@/screens/finance/BudgetAlertsScreen";
import FinanceSettingsScreen from "@/screens/finance/FinanceSettingsScreen";
import type { FinanceStackParamList } from "@/types/finance";

const Stack = createStackNavigator<FinanceStackParamList>();

export default function FinanceNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FinanceHome" component={FinanceHomeScreen} />
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
      <Stack.Screen name="GrantsOverview" component={GrantsOverviewScreen} />
      <Stack.Screen name="GrantDetail" component={GrantDetailScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Budgets" component={BudgetScreen} />
      <Stack.Screen name="BudgetAlerts" component={BudgetAlertsScreen} />
      <Stack.Screen name="FinanceSettings" component={FinanceSettingsScreen} />
    </Stack.Navigator>
  );
}
