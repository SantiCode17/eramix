import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
  ProfileScreen,
  EditProfileScreen,
  EditPhotosScreen,
  InterestsScreen,
  LanguagesScreen,
} from "@/screens/profile";
import type { ProfileStackParamList } from "@/types";

const Stack = createStackNavigator<ProfileStackParamList>();

export default function ProfileNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "transparent" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="EditPhotos" component={EditPhotosScreen} />
      <Stack.Screen name="Interests" component={InterestsScreen} />
      <Stack.Screen name="Languages" component={LanguagesScreen} />
    </Stack.Navigator>
  );
}
