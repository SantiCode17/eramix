import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { PlacesToVisitScreen } from "@/screens";

const Stack = createStackNavigator();

export default function PlacesToVisitNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlacesToVisit" component={PlacesToVisitScreen} />
    </Stack.Navigator>
  );
}
