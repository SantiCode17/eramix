import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator, DrawerContentScrollView } from "@react-navigation/drawer";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { LinearGradient } from "expo-linear-gradient";
import {
  AboutScreen,
} from "@/screens/main";
import { NotificationsScreen } from "@/screens/notifications";
import { GlobeScreen } from "@/screens/globe";
import DiscoverNavigator from "./DiscoverNavigator";
import EventsNavigator from "./EventsNavigator";
import ChatNavigator from "./ChatNavigator";
import GroupsNavigator from "./GroupsNavigator";
import CommunitiesNavigator from "./CommunitiesNavigator";
import ProfileNavigator from "./ProfileNavigator";
import SettingsNavigator from "./SettingsNavigator";
import { useAuthStore } from "@/store/useAuthStore";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { MainTabParamList, DrawerParamList } from "@/types";

// ── Tab Navigator ───────────────────────────────────
const Tab = createBottomTabNavigator<MainTabParamList>();

const tabConfig: Record<
  keyof MainTabParamList,
  { label: string; emoji: string }
> = {
  Discover: { label: "Descubrir", emoji: "🔍" },
  Globe: { label: "Globo", emoji: "🌍" },
  Events: { label: "Eventos", emoji: "🎉" },
  Chat: { label: "Chat", emoji: "💬" },
  Groups: { label: "Grupos", emoji: "👥" },
  Communities: { label: "Comunidad", emoji: "🏘️" },
  Notifications: { label: "Alertas", emoji: "🔔" },
  Profile: { label: "Perfil", emoji: "👤" },
};

function HomeTabs(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "rgba(26, 26, 46, 0.95)",
          borderTopColor: "rgba(255, 255, 255, 0.1)",
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.eu.star,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarLabelStyle: {
          fontFamily: typography.families.bodyMedium,
          fontSize: 11,
        },
        tabBarIcon: ({ focused }) => {
          const config = tabConfig[route.name];
          return (
            <Text
              style={{
                fontSize: 22,
                opacity: focused ? 1 : 0.5,
              }}
            >
              {config.emoji}
            </Text>
          );
        },
        tabBarLabel: tabConfig[route.name].label,
      })}
    >
      <Tab.Screen name="Discover" component={DiscoverNavigator} />
      <Tab.Screen name="Globe" component={GlobeScreen} />
      <Tab.Screen name="Events" component={EventsNavigator} />
      <Tab.Screen name="Chat" component={ChatNavigator} />
      <Tab.Screen name="Groups" component={GroupsNavigator} />
      <Tab.Screen name="Communities" component={CommunitiesNavigator} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}

// ── Custom Drawer Content ───────────────────────────
function CustomDrawerContent(props: DrawerContentComponentProps): React.JSX.Element {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const drawerItems = [
    { label: "Inicio", emoji: "🏠", route: "HomeTabs" as const },
    { label: "Ajustes", emoji: "⚙️", route: "Settings" as const },
    { label: "Acerca de", emoji: "ℹ️", route: "About" as const },
  ];

  return (
    <DrawerContentScrollView {...props} style={styles.drawerScroll}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      {/* User header */}
      <View style={styles.drawerHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>
            {user?.firstName?.[0]?.toUpperCase() ?? "?"}
          </Text>
        </View>
        <Text style={styles.drawerName}>
          {user ? `${user.firstName} ${user.lastName}` : "Usuario"}
        </Text>
        <Text style={styles.drawerEmail}>{user?.email ?? ""}</Text>
      </View>

      {/* Navigation items */}
      <View style={styles.drawerItems}>
        {drawerItems.map((item) => (
          <Pressable
            key={item.route}
            style={styles.drawerItem}
            onPress={() => props.navigation.navigate(item.route)}
          >
            <Text style={styles.drawerItemEmoji}>{item.emoji}</Text>
            <Text style={styles.drawerItemLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Logout */}
      <View style={styles.drawerFooter}>
        <Pressable
          style={styles.logoutButton}
          onPress={async () => {
            await logout();
          }}
        >
          <Text style={styles.logoutEmoji}>🚪</Text>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
}

// ── Drawer Navigator ────────────────────────────────
const Drawer = createDrawerNavigator<DrawerParamList>();

export default function MainNavigator(): React.JSX.Element {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: colors.background.end,
          width: 280,
        },
        drawerType: "front",
        swipeEdgeWidth: 50,
      }}
    >
      <Drawer.Screen name="HomeTabs" component={HomeTabs} />
      <Drawer.Screen name="Settings" component={SettingsNavigator} />
      <Drawer.Screen name="About" component={AboutScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerScroll: {
    flex: 1,
    backgroundColor: colors.background.end,
  },
  drawerHeader: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: spacing.md,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 204, 0, 0.2)",
    borderWidth: 2,
    borderColor: colors.eu.star,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarEmoji: {
    fontFamily: typography.families.heading,
    fontSize: 24,
    color: colors.eu.star,
  },
  drawerName: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  drawerEmail: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.small.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  drawerItems: {
    paddingHorizontal: spacing.sm,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.xxs,
  },
  drawerItemEmoji: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  drawerItemLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  drawerFooter: {
    marginTop: "auto",
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
  },
  logoutEmoji: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  logoutText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.body.fontSize,
    color: colors.status.error,
  },
});
