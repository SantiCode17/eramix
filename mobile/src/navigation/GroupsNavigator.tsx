import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
  GroupsListScreen,
  GroupChatScreen,
  CreateGroupScreen,
  GroupSettingsScreen,
} from "@/screens/groups";
import type { GroupsStackParamList } from "@/types/groups";

const Stack = createStackNavigator<GroupsStackParamList>();

export default function GroupsNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="GroupsList" component={GroupsListScreen} />
      <Stack.Screen name="GroupChat" component={GroupChatScreen} />
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen name="GroupSettings" component={GroupSettingsScreen} />
        <Stack.Screen
          name="VoiceMessage"
          component={require("@/screens/chat/VoiceMessageScreen").default}
          options={{
            presentation: "transparentModal",
            cardOverlayEnabled: true,
          }}
        />
    </Stack.Navigator>
  );
}
