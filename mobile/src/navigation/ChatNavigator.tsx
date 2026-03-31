import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ConversationsScreen, ChatScreen } from "@/screens/chat";
import type { ChatStackParamList } from "@/types/chat";

const Stack = createStackNavigator<ChatStackParamList>();

export default function ChatNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ConversationsList" component={ConversationsScreen} />
      <Stack.Screen name="ChatRoom" component={ChatScreen} />
    </Stack.Navigator>
  );
}
