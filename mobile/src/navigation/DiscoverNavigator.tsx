import React from "react";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import {
  DiscoverScreen,
  NearbyMapScreen,
  FriendRequestsScreen,
  UserDetailScreen,
  SmartMatchScreen,
  ActivityFeedScreen,
  CulturalMapScreen,
  TimeCapsuleScreen,
  LiveLocationScreen,
} from "@/screens/discover";
import { NotificationsScreen } from "@/screens/notifications";
import type { DiscoverStackParamList } from "@/types";

const Stack = createStackNavigator<DiscoverStackParamList>();

export default function DiscoverNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "transparent" },
        ...TransitionPresets.SlideFromRightIOS,
      }}
    >
      <Stack.Screen name="DiscoverMain" component={DiscoverScreen} />
      <Stack.Screen name="NearbyMap" component={NearbyMapScreen} />
      <Stack.Screen name="FriendRequests" component={FriendRequestsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen
        name="UserDetail"
        component={UserDetailScreen}
        options={{ ...TransitionPresets.ModalSlideFromBottomIOS }}
      />
      <Stack.Screen
        name="SmartMatch"
        component={SmartMatchScreen}
        options={{ ...TransitionPresets.ModalSlideFromBottomIOS }}
      />
      <Stack.Screen name="ActivityFeed" component={ActivityFeedScreen} />
      <Stack.Screen name="CulturalMap" component={CulturalMapScreen} />
      <Stack.Screen name="TimeCapsule" component={TimeCapsuleScreen} />
      <Stack.Screen
        name="LiveLocation"
        component={LiveLocationScreen}
        options={{ ...TransitionPresets.ModalSlideFromBottomIOS }}
      />
    </Stack.Navigator>
  );
}
