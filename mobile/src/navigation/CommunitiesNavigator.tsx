import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
  CommunitiesScreen,
  CommunityFeedScreen,
  CreateCommunityScreen,
  CreateCommunityPostScreen,
} from "@/screens/communities";
import type { CommunitiesStackParamList } from "@/types/communities";

const Stack = createStackNavigator<CommunitiesStackParamList>();

export default function CommunitiesNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="CommunitiesList" component={CommunitiesScreen} />
      <Stack.Screen name="CommunityFeed" component={CommunityFeedScreen} />
      <Stack.Screen
        name="CreateCommunity"
        component={CreateCommunityScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="CreateCommunityPost"
        component={CreateCommunityPostScreen}
        options={{ presentation: "modal" }}
      />
    </Stack.Navigator>
  );
}
