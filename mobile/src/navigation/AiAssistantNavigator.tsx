import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AiChatScreen } from "@/screens/aiAssistant";
import type { AiAssistantStackParamList } from "@/types/aiAssistant";

const Stack = createStackNavigator<AiAssistantStackParamList>();

export default function AiAssistantNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AiChat" component={AiChatScreen} />
    </Stack.Navigator>
  );
}
