import React from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AboutScreen } from "@/screens/main";
import { NotificationsScreen } from "@/screens/notifications";
import { GlobeScreen } from "@/screens/globe";
import DiscoverNavigator from "./DiscoverNavigator";
import EventsNavigator from "./EventsNavigator";
import ChatNavigator from "./ChatNavigator";
import GroupsNavigator from "./GroupsNavigator";
import CommunitiesNavigator from "./CommunitiesNavigator";
import ProfileNavigator from "./ProfileNavigator";
import ExchangeNavigator from "./ExchangeNavigator";
import GamificationNavigator from "./GamificationNavigator";
import ChallengesNavigator from "./ChallengesNavigator";
import HousingNavigator from "./HousingNavigator";
import CityGuideNavigator from "./CityGuideNavigator";
import AiAssistantNavigator from "./AiAssistantNavigator";
import SettingsNavigator from "./SettingsNavigator";
import { useAuthStore } from "@/store/useAuthStore";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { MainTabParamList, DrawerParamList } from "@/types";

// ── Tab config with Ionicons ────────────────────────
const Tab = createBottomTabNavigator<MainTabParamList>();

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const tabConfig: Record<
  keyof MainTabParamList,
  { label: string; icon: IoniconsName; activeIcon: IoniconsName }
> = {
  Discover: { label: "Inicio", icon: "compass-outline", activeIcon: "compass" },
  Events: { label: "Eventos", icon: "calendar-outline", activeIcon: "calendar" },
  Chat: { label: "Chat", icon: "chatbubbles-outline", activeIcon: "chatbubbles" },
  Communities: { label: "Social", icon: "people-outline", activeIcon: "people" },
  Profile: { label: "Perfil", icon: "person-outline", activeIcon: "person" },
};

function HomeTabs(): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: "absolute" as const,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(10, 10, 24, 0.92)",
          borderTopColor: "rgba(255, 255, 255, 0.06)",
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: colors.eu.star,
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.4)",
        tabBarLabelStyle: {
          fontFamily: typography.families.bodyMedium,
          fontSize: 11,
          letterSpacing: 0.2,
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color }) => {
          const config = tabConfig[route.name];
          return (
            <View style={styles.tabIconContainer}>
              <Ionicons
                name={focused ? config.activeIcon : config.icon}
                size={22}
                color={color}
              />
              {focused && <View style={styles.activeTabDot} />}
            </View>
          );
        },
        tabBarLabel: tabConfig[route.name].label,
      })}
    >
      <Tab.Screen name="Discover" component={DiscoverNavigator} />
      <Tab.Screen name="Events" component={EventsNavigator} />
      <Tab.Screen name="Chat" component={ChatNavigator} />
      <Tab.Screen name="Communities" component={CommunitiesNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}

// ── Drawer Items ────────────────────────────────────
type IoniconsName2 = React.ComponentProps<typeof Ionicons>["name"];

interface DrawerItemConfig {
  label: string;
  icon: IoniconsName2;
  route: keyof DrawerParamList;
  section: "main" | "tools" | "settings";
}

const drawerItemsList: DrawerItemConfig[] = [
  { label: "Inicio", icon: "home-outline", route: "HomeTabs", section: "main" },
  { label: "Globo", icon: "globe-outline", route: "Globe", section: "main" },
  { label: "Grupos", icon: "chatbubble-ellipses-outline", route: "Groups", section: "main" },
  { label: "Notificaciones", icon: "notifications-outline", route: "Notifications", section: "main" },
  { label: "Intercambio", icon: "swap-horizontal-outline", route: "Exchange", section: "tools" },
  { label: "Logros", icon: "trophy-outline", route: "Gamification", section: "tools" },
  { label: "Retos", icon: "flash-outline", route: "Challenges", section: "tools" },
  { label: "Alojamiento", icon: "bed-outline", route: "Housing", section: "tools" },
  { label: "Guía Ciudad", icon: "map-outline", route: "CityGuide", section: "tools" },
  { label: "Asistente IA", icon: "sparkles-outline", route: "AiAssistant", section: "tools" },
  { label: "Ajustes", icon: "settings-outline", route: "Settings", section: "settings" },
  { label: "Acerca de", icon: "information-circle-outline", route: "About", section: "settings" },
];

function CustomDrawerContent(
  props: DrawerContentComponentProps,
): React.JSX.Element {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const insets = useSafeAreaInsets();

  const sections = {
    main: drawerItemsList.filter((i) => i.section === "main"),
    tools: drawerItemsList.filter((i) => i.section === "tools"),
    settings: drawerItemsList.filter((i) => i.section === "settings"),
  };

  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : "Usuario";
  const initials =
    (user?.firstName?.[0] ?? "?") + (user?.lastName?.[0] ?? "");

  return (
    <View style={styles.drawerRoot}>
      <LinearGradient
        colors={["#0A0A18", "#0D1030", "#0A0A18"]}
        style={StyleSheet.absoluteFill}
      />

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={[
          styles.drawerScrollContent,
          { paddingTop: insets.top + spacing.md },
        ]}
      >
        {/* User header */}
        <View style={styles.drawerHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>
              {initials.toUpperCase()}
            </Text>
          </View>
          <View style={styles.drawerUserInfo}>
            <Text style={styles.drawerName} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.drawerEmail} numberOfLines={1}>
              {user?.email ?? ""}
            </Text>
          </View>
        </View>

        {/* Main section */}
        <View style={styles.drawerSection}>
          {sections.main.map((item) => (
            <Pressable
              key={item.route}
              style={({ pressed }) => [
                styles.drawerItem,
                pressed && styles.drawerItemPressed,
              ]}
              onPress={() => props.navigation.navigate(item.route)}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color="rgba(255,255,255,0.7)"
              />
              <Text style={styles.drawerItemLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.drawerDivider} />

        {/* Tools section */}
        <Text style={styles.drawerSectionTitle}>Herramientas</Text>
        <View style={styles.drawerSection}>
          {sections.tools.map((item) => (
            <Pressable
              key={item.route}
              style={({ pressed }) => [
                styles.drawerItem,
                pressed && styles.drawerItemPressed,
              ]}
              onPress={() => props.navigation.navigate(item.route)}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color="rgba(255,255,255,0.7)"
              />
              <Text style={styles.drawerItemLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.drawerDivider} />

        {/* Settings */}
        <View style={styles.drawerSection}>
          {sections.settings.map((item) => (
            <Pressable
              key={item.route}
              style={({ pressed }) => [
                styles.drawerItem,
                pressed && styles.drawerItemPressed,
              ]}
              onPress={() => props.navigation.navigate(item.route)}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color="rgba(255,255,255,0.7)"
              />
              <Text style={styles.drawerItemLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </DrawerContentScrollView>

      {/* Logout at bottom */}
      <View style={[styles.drawerFooter, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={async () => {
            await logout();
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.status.error} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </View>
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
          backgroundColor: "transparent",
          width: 290,
        },
        drawerType: "front",
        swipeEdgeWidth: 50,
        overlayColor: "rgba(0, 0, 0, 0.6)",
      }}
    >
      <Drawer.Screen name="HomeTabs" component={HomeTabs} />
      <Drawer.Screen name="Globe" component={GlobeScreen} />
      <Drawer.Screen name="Groups" component={GroupsNavigator} />
      <Drawer.Screen name="Notifications" component={NotificationsScreen} />
      <Drawer.Screen name="Exchange" component={ExchangeNavigator} />
      <Drawer.Screen name="Gamification" component={GamificationNavigator} />
      <Drawer.Screen name="Challenges" component={ChallengesNavigator} />
      <Drawer.Screen name="Housing" component={HousingNavigator} />
      <Drawer.Screen name="CityGuide" component={CityGuideNavigator} />
      <Drawer.Screen name="AiAssistant" component={AiAssistantNavigator} />
      <Drawer.Screen name="Settings" component={SettingsNavigator} />
      <Drawer.Screen name="About" component={AboutScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  // Tab bar
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 28,
  },
  activeTabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.eu.star,
    marginTop: 3,
  },

  // Drawer
  drawerRoot: {
    flex: 1,
  },
  drawerScrollContent: {
    paddingHorizontal: spacing.md,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 204, 0, 0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 204, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontFamily: typography.families.heading,
    fontSize: 16,
    color: colors.eu.star,
  },
  drawerUserInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  drawerName: {
    fontFamily: typography.families.subheading,
    fontSize: 15,
    color: colors.text.primary,
  },
  drawerEmail: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  drawerSection: {
    gap: 2,
  },
  drawerSectionTitle: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.35)",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    gap: spacing.md,
  },
  drawerItemPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  drawerItemLabel: {
    fontFamily: typography.families.body,
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.85)",
  },
  drawerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginVertical: spacing.md,
    marginHorizontal: spacing.md,
  },
  drawerFooter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  logoutText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 15,
    color: colors.status.error,
  },
});
