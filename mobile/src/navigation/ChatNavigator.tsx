import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ConversationsScreen, ChatScreen, VoiceMessageScreen } from "@/screens/chat";
import { CreateGroupScreen, GroupChatScreen, GroupSettingsScreen } from "@/screens/groups";
import type { ChatStackParamList } from "@/types/chat";

const Stack = createStackNavigator<ChatStackParamList>();

export default function ChatNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ConversationsList" component={ConversationsScreen} />
      <Stack.Screen name="ChatRoom" component={ChatScreen} />
      <Stack.Screen name="VoiceMessage" component={VoiceMessageScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="GroupChat" component={GroupChatScreen} />
      <Stack.Screen name="GroupSettings" component={GroupSettingsScreen} />
    </Stack.Navigator>
  );
}
