import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { CityGuideListScreen, PlaceDetailScreen } from "@/screens/cityGuide";
import type { CityGuideStackParamList } from "@/types/cityGuide";

const Stack = createStackNavigator<CityGuideStackParamList>();

export default function CityGuideNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CityGuideList" component={CityGuideListScreen} />
      <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
    </Stack.Navigator>
  );
}
