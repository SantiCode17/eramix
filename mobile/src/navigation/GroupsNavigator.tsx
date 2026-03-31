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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GroupsList" component={GroupsListScreen} />
      <Stack.Screen name="GroupChat" component={GroupChatScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="GroupSettings" component={GroupSettingsScreen} />
    </Stack.Navigator>
  );
}
