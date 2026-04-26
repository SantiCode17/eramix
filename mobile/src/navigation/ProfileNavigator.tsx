import React from "react";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import ProfileScreen from "@/screens/profile/ProfileScreen";
import EditProfileHubScreen from "@/screens/profile/EditProfileHubScreen";
import ProfilePreviewScreen from "@/screens/profile/ProfilePreviewScreen";
import EditAboutScreen from "@/screens/profile/EditAboutScreen";
import EditBasicsScreen from "@/screens/profile/EditBasicsScreen";
import EditLifestyleScreen from "@/screens/profile/EditLifestyleScreen";
import EditPassionsScreen from "@/screens/profile/EditPassionsScreen";
import EditSongScreen from "@/screens/profile/EditSongScreen";
import type { ProfileStackParamList } from "@/types";

const Stack = createStackNavigator<ProfileStackParamList>();

export default function ProfileNavigator({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}): React.JSX.Element {


  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "transparent" },
        ...TransitionPresets.SlideFromRightIOS,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfileHub" component={EditProfileHubScreen} />
      <Stack.Screen
        name="ProfilePreview"
        component={ProfilePreviewScreen}
        options={{ ...TransitionPresets.ModalSlideFromBottomIOS }}
      />
      <Stack.Screen name="EditAbout" component={EditAboutScreen} />
      <Stack.Screen name="EditBasics" component={EditBasicsScreen} />
      <Stack.Screen name="EditLifestyle" component={EditLifestyleScreen} />
      <Stack.Screen name="EditPassions" component={EditPassionsScreen} />
      <Stack.Screen name="EditSong" component={EditSongScreen} />
    </Stack.Navigator>
  );
}
