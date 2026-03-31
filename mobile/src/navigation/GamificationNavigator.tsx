import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
  GamificationHomeScreen,
  AchievementsScreen,
  LeaderboardScreen,
} from "@/screens/gamification";
import type { GamificationStackParamList } from "@/types/gamification";

const Stack = createStackNavigator<GamificationStackParamList>();

export default function GamificationNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GamificationHome" component={GamificationHomeScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
    </Stack.Navigator>
  );
}
