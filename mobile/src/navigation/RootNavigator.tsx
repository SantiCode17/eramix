import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { HomeScreen, ComponentGallery } from "@/screens";

export type RootStackParamList = {
  Home: undefined;
  ComponentGallery: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: "transparent" },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        {__DEV__ && (
          <Stack.Screen name="ComponentGallery" component={ComponentGallery} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
