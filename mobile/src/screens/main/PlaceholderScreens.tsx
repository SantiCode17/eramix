import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { colors, typography, spacing } from "@/design-system/tokens";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

interface Props {
  title: string;
  icon: IoniconsName;
}

export default function PlaceholderScreen({ title, icon }: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />
      <Ionicons name={icon} size={64} color={colors.text.secondary} style={{ marginBottom: spacing.md }} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Próximamente</Text>
    </View>
  );
}

// ── Tab placeholder factories ───────────────────────
export function DiscoverScreen() {
  return <PlaceholderScreen title="Discover" icon="compass-outline" />;
}
export function EventsScreen() {
  return <PlaceholderScreen title="Eventos" icon="calendar-outline" />;
}
export function ChatListScreen() {
  return <PlaceholderScreen title="Chat" icon="chatbubbles-outline" />;
}
export function NotificationsScreen() {
  return <PlaceholderScreen title="Notificaciones" icon="notifications-outline" />;
}
export function ProfileScreen() {
  return <PlaceholderScreen title="Perfil" icon="person-outline" />;
}

// ── Drawer placeholder factories ────────────────────
export function SettingsScreen() {
  return <PlaceholderScreen title="Ajustes" icon="settings-outline" />;
}
export function AboutScreen() {
  return <PlaceholderScreen title="Acerca de" icon="information-circle-outline" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: typography.families.heading,
    fontSize: 28,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
  },
});
