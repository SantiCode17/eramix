import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ChallengesListScreen, ChallengeDetailScreen } from "@/screens/challenges";
import type { ChallengesStackParamList } from "@/types/challenges";

const Stack = createStackNavigator<ChallengesStackParamList>();

export default function ChallengesNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChallengesList" component={ChallengesListScreen} />
      <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
    </Stack.Navigator>
  );
}
