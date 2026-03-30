import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, typography, spacing } from "@/design-system/tokens";

interface Props {
  title: string;
  emoji: string;
}

export default function PlaceholderScreen({ title, emoji }: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Próximamente</Text>
    </View>
  );
}

// ── Tab placeholder factories ───────────────────────
export function DiscoverScreen() {
  return <PlaceholderScreen title="Discover" emoji="🔍" />;
}
export function EventsScreen() {
  return <PlaceholderScreen title="Eventos" emoji="🎉" />;
}
export function ChatListScreen() {
  return <PlaceholderScreen title="Chat" emoji="💬" />;
}
export function NotificationsScreen() {
  return <PlaceholderScreen title="Notificaciones" emoji="🔔" />;
}
export function ProfileScreen() {
  return <PlaceholderScreen title="Perfil" emoji="👤" />;
}

// ── Drawer placeholder factories ────────────────────
export function SettingsScreen() {
  return <PlaceholderScreen title="Ajustes" emoji="⚙️" />;
}
export function AboutScreen() {
  return <PlaceholderScreen title="Acerca de" emoji="ℹ️" />;
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
