import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
  EventsScreen,
  EventDetailScreen,
  CreateEventScreen,
} from "@/screens/events";
import type { EventsStackParamList } from "@/types/events";

const Stack = createStackNavigator<EventsStackParamList>();

export default function EventsNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="EventsList" component={EventsScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        options={{ presentation: "modal" }}
      />
    </Stack.Navigator>
  );
}
