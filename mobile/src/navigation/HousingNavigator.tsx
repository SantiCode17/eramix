import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { HousingListScreen, HousingDetailScreen } from "@/screens/housing";
import type { HousingStackParamList } from "@/types/housing";

const Stack = createStackNavigator<HousingStackParamList>();

export default function HousingNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HousingList" component={HousingListScreen} />
      <Stack.Screen name="HousingDetail" component={HousingDetailScreen} />
    </Stack.Navigator>
  );
}
