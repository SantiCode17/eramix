import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
  DiscoverScreen,
  NearbyMapScreen,
  FriendRequestsScreen,
  UserDetailScreen,
} from "@/screens/discover";
import type { DiscoverStackParamList } from "@/types";

const Stack = createStackNavigator<DiscoverStackParamList>();

export default function DiscoverNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="DiscoverMain" component={DiscoverScreen} />
      <Stack.Screen
        name="NearbyMap"
        component={NearbyMapScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="FriendRequests"
        component={FriendRequestsScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="UserDetail"
        component={UserDetailScreen}
        options={{ animation: "slide_from_bottom" }}
      />
    </Stack.Navigator>
  );
}
