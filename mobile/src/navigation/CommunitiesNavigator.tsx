import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
  CommunitiesScreen,
  CommunityFeedScreen,
  CreateCommunityPostScreen,
} from "@/screens/communities";
import type { CommunitiesStackParamList } from "@/types/communities";

const Stack = createStackNavigator<CommunitiesStackParamList>();

export default function CommunitiesNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CommunitiesList" component={CommunitiesScreen} />
      <Stack.Screen name="CommunityFeed" component={CommunityFeedScreen} />
      <Stack.Screen
        name="CreateCommunityPost"
        component={CreateCommunityPostScreen}
      />
    </Stack.Navigator>
  );
}
