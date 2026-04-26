/**
 * ════════════════════════════════════════════════════
 *  MainNavigator — European Glass · Tab Bar + Drawer
 *  Glass blur TabBar · Animated dot · EU Gold
 * ════════════════════════════════════════════════════
 */
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

import { AboutScreen } from "@/screens/main";
import { GlobeScreen } from "@/screens/globe";
import { PlacesToVisitScreen } from "@/screens";
import DiscoverNavigator from "./DiscoverNavigator";
import EventsNavigator from "./EventsNavigator";
import ChatNavigator from "./ChatNavigator";
import CommunitiesNavigator from "./CommunitiesNavigator";
import ProfileNavigator from "./ProfileNavigator";
import AiAssistantNavigator from "./AiAssistantNavigator";
import FinanceNavigator from "./FinanceNavigator";
import TicketingNavigator from "./TicketingNavigator";
import WellbeingNavigator from "./WellbeingNavigator";
import SettingsNavigator from "./SettingsNavigator";

import { useAuthStore } from "@/store/useAuthStore";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import {
  colors,
  typography,
  spacing,
  radii,
  borders,
  DS,
} from "@/design-system/tokens";
import type { MainTabParamList, DrawerParamList } from "@/types";

/* ═══ Tab config ═══ */
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

/* ═══ HomeTabs ═══ */
function HomeTabs(): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: DS.background }}>
      <Tab.Navigator
        screenOptions={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? '';
          const hiddenRoutes = [
            "EditProfileHub",
            "ManageCard",
            "ProfilePreview",
            "EditAbout",
            "EditBasics",
            "EditLifestyle",
            "EditPassions",
            "EditSong",
            "EditPhotos",
            "CreateEvent",
            "CreateGroup",
            "GroupChat",
            "GroupSettings",
            "ChatRoom",
            "VoiceMessage",
            "CreateCommunity",
            "CommunityFeed",
            "CreateCommunityPost",
            "UserDetail",
            "FriendRequests",
          ];
          const isHidden = hiddenRoutes.includes(routeName);

          return {
            headerShown: false,
            sceneStyle: { backgroundColor: DS.background },
            tabBarStyle: isHidden ? { display: "none" } : {
              position: "absolute" as const,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "rgba(4,6,26,0.92)",
              borderTopWidth: 0,
              height: 64 + insets.bottom,
              paddingBottom: insets.bottom,
              paddingTop: 8,
              elevation: 0,
              shadowOpacity: 0,
            },
          tabBarBackground: () => (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(4,6,26,0.92)", overflow: "hidden" },
              ]}
            >
              <BlurView
                intensity={40}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
            </View>
          ),
          tabBarActiveTintColor: colors.eu.star,
          tabBarInactiveTintColor: colors.text.tertiary,
          tabBarLabelStyle: {
            fontFamily: typography.families.body,
            fontSize: 10,
            marginTop: 2,
          },
          tabBarIcon: ({ focused, color }) => {
            const cfg = tabConfig[route.name];
            return (
              <View style={st.tabIconWrap}>
                <Ionicons
                  name={focused ? cfg.activeIcon : cfg.icon}
                  size={22}
                  color={color}
                  style={{ marginBottom: -2 }}
                />
                {focused && <View style={st.activeDot} />}
              </View>
            );
          },
          tabBarLabel: tabConfig[route.name].label,
          tabBarButton: ({
            onPress,
            children,
            style,
            accessibilityRole,
            accessibilityState,
          }) => (
            <Pressable
              style={style}
              accessibilityRole={accessibilityRole}
              accessibilityState={accessibilityState}
              onPress={(e) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress?.(e);
              }}
            >
              {children}
            </Pressable>
          ),
          };
        }}
      >
        <Tab.Screen name="Discover" component={DiscoverNavigator} />
        <Tab.Screen name="Events" component={EventsNavigator} />
        <Tab.Screen name="Chat" component={ChatNavigator} />
        <Tab.Screen name="Communities" component={CommunitiesNavigator} />
        <Tab.Screen name="Profile" component={ProfileNavigator} />
      </Tab.Navigator>
    </View>
  );
}

/* ═══ Drawer items ═══ */
interface DrawerItemConfig {
  label: string;
  icon: IoniconsName;
  route: keyof DrawerParamList;
  section: "main" | "tools" | "settings";
}

const drawerItemsList: DrawerItemConfig[] = [
  { label: "Inicio", icon: "home-outline", route: "HomeTabs", section: "main" },
  { label: "Globo", icon: "globe-outline", route: "Globe", section: "main" },
  { label: "Finanzas", icon: "wallet-outline", route: "Finance", section: "tools" },
  { label: "Tickets", icon: "ticket-outline", route: "Ticketing", section: "tools" },
  { label: "Lugares", icon: "map-outline", route: "PlacesToVisit", section: "tools" },
  { label: "Bienestar", icon: "heart-outline", route: "Wellbeing", section: "tools" },
  { label: "Asistente IA", icon: "sparkles-outline", route: "AiAssistant", section: "tools" },
  { label: "Ajustes", icon: "settings-outline", route: "Settings", section: "settings" },
  { label: "Acerca de", icon: "information-circle-outline", route: "About", section: "settings" },
];

/* ═══ Custom Drawer — European Glass ═══ */
function CustomDrawerContent(
  props: DrawerContentComponentProps
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
    <View style={st.drawerRoot}>
      <LinearGradient
        colors={[DS.background, "#0E1A35", "#0F1535"]}
        style={StyleSheet.absoluteFill}
      />

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={[
          st.drawerScroll,
          { paddingTop: insets.top + spacing.md },
        ]}
      >
        {/* ── User header ── */}
        <Pressable
          style={st.drawerHeader}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            props.navigation.navigate("HomeTabs", { screen: "Profile" });
          }}
        >
          {user?.profilePhotoUrl ? (
            <Image
              source={{ uri: resolveMediaUrl(user.profilePhotoUrl) }}
              style={st.avatarImg}
            />
          ) : (
            <LinearGradient
              colors={["rgba(255,215,0,0.15)", "rgba(19,34,64,0.3)"]}
              style={st.avatarCircle}
            >
              <Text style={st.avatarInitials}>
                {initials.toUpperCase()}
              </Text>
            </LinearGradient>
          )}
          <View style={st.userInfo}>
            <Text style={st.userName} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={st.userEmail} numberOfLines={1}>
              {user?.email ?? ""}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={16}
            color="rgba(255,215,0,0.4)"
          />
        </Pressable>

        {/* ── Main ── */}
        <View style={st.section}>
          {sections.main.map((item) => (
            <Pressable
              key={item.route}
              style={({ pressed }) => [
                st.drawerItem,
                pressed && st.drawerItemPressed,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                props.navigation.navigate(item.route);
              }}
            >
              <View style={st.drawerIconWrap}>
                <Ionicons
                  name={item.icon}
                  size={19}
                  color="rgba(255,215,0,0.65)"
                />
              </View>
              <Text style={st.drawerLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={st.divider} />

        {/* ── Tools ── */}
        <Text style={st.sectionTitle}>Herramientas</Text>
        <View style={st.section}>
          {sections.tools.map((item) => (
            <Pressable
              key={item.route}
              style={({ pressed }) => [
                st.drawerItem,
                pressed && st.drawerItemPressed,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                props.navigation.navigate(item.route);
              }}
            >
              <View style={st.drawerIconWrap}>
                <Ionicons
                  name={item.icon}
                  size={19}
                  color="rgba(255,215,0,0.65)"
                />
              </View>
              <Text style={st.drawerLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={st.divider} />

        {/* ── Settings ── */}
        <View style={st.section}>
          {sections.settings.map((item) => (
            <Pressable
              key={item.route}
              style={({ pressed }) => [
                st.drawerItem,
                pressed && st.drawerItemPressed,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                props.navigation.navigate(item.route);
              }}
            >
              <View style={st.drawerIconWrap}>
                <Ionicons
                  name={item.icon}
                  size={19}
                  color="rgba(255,215,0,0.65)"
                />
              </View>
              <Text style={st.drawerLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </DrawerContentScrollView>

      {/* ── Logout ── */}
      <View
        style={[
          st.drawerFooter,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            st.logoutBtn,
            pressed && { opacity: 0.7 },
          ]}
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await logout();
          }}
        >
          <LinearGradient
            colors={["rgba(255,79,111,0.12)", "rgba(255,79,111,0.04)"]}
            style={st.logoutGrad}
          >
            <Ionicons name="log-out-outline" size={18} color="#FF4F6F" />
            <Text style={st.logoutText}>Cerrar sesión</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

/* ═══ Drawer Navigator ═══ */
const Drawer = createDrawerNavigator<DrawerParamList>();

export default function MainNavigator(): React.JSX.Element {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: "transparent", width: 295 },
        drawerType: "front",
        swipeEdgeWidth: 50,
        overlayColor: "rgba(0,0,0,0.65)",
      }}
    >
      <Drawer.Screen name="HomeTabs" component={HomeTabs} />
      <Drawer.Screen name="Globe" component={GlobeScreen} />
      <Drawer.Screen name="Finance" component={FinanceNavigator} />
      <Drawer.Screen name="Ticketing" component={TicketingNavigator} />
      <Drawer.Screen name="PlacesToVisit" component={PlacesToVisitScreen} />
      <Drawer.Screen name="Wellbeing" component={WellbeingNavigator} />
      <Drawer.Screen name="AiAssistant" component={AiAssistantNavigator} />
      <Drawer.Screen name="Settings" component={SettingsNavigator} />
      <Drawer.Screen name="About" component={AboutScreen} />
    </Drawer.Navigator>
  );
}

/* ═══ Styles — European Glass ═══ */
const st = StyleSheet.create({
  /* Tab bar */
  tabIconWrap: {
    alignItems: "center",
    justifyContent: "center",
    height: 30,
    width: 44,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.eu.star,
    marginTop: 3,
  },

  /* Drawer */
  drawerRoot: { flex: 1 },
  drawerScroll: { paddingHorizontal: spacing.md },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,215,0,0.30)",
  },
  avatarImg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: "rgba(255,215,0,0.30)",
  },
  avatarInitials: {
    fontFamily: typography.families.heading,
    fontSize: 16,
    color: colors.eu.star,
  },
  userInfo: { marginLeft: spacing.md, flex: 1 },
  userName: {
    fontFamily: typography.families.subheading,
    fontSize: 15,
    color: colors.text.primary,
  },
  userEmail: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },

  section: { gap: 1 },
  sectionTitle: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 10,
    color: "rgba(255,255,255,0.30)",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    gap: spacing.md,
  },
  drawerItemPressed: { backgroundColor: "rgba(255,255,255,0.05)" },
  drawerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,215,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,215,0,0.12)",
  },
  drawerLabel: {
    fontFamily: typography.families.body,
    fontSize: 15,
    color: "rgba(255,255,255,0.82)",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: spacing.md,
    marginHorizontal: spacing.md,
  },

  /* Footer */
  drawerFooter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  logoutBtn: { borderRadius: radii.md, overflow: "hidden" },
  logoutGrad: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: borders.hairline,
    borderColor: "rgba(255,79,111,0.15)",
  },
  logoutText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 15,
    color: "#FF4F6F",
  },
});
