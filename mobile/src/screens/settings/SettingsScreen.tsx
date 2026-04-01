import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { GlassCard, Header } from "@/design-system/components";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import { useAuthStore } from "@/store";
import type { SettingsStackParamList } from "@/types";

type IoniconsName = keyof typeof Ionicons.glyphMap;
type Nav = StackNavigationProp<SettingsStackParamList, "SettingsMain">;

interface SettingsItem {
  icon: IoniconsName;
  label: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}

export default function SettingsScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const logout = useAuthStore((s) => s.logout);

  const sections: { title: string; items: SettingsItem[] }[] = [
    {
      title: "Cuenta",
      items: [
        {
          icon: "lock-closed-outline",
          label: "Privacidad",
          subtitle: "Visibilidad del perfil",
          onPress: () => navigation.navigate("PrivacySettings"),
        },
        {
          icon: "notifications-outline",
          label: "Notificaciones",
          subtitle: "Preferencias de alertas",
          onPress: () => navigation.navigate("NotificationSettings"),
        },
        {
          icon: "ban-outline",
          label: "Usuarios bloqueados",
          subtitle: "Gestionar bloqueos",
          onPress: () => navigation.navigate("BlockedUsers"),
        },
      ],
    },
    {
      title: "Zona peligrosa",
      items: [
        {
          icon: "log-out-outline",
          label: "Cerrar sesión",
          onPress: async () => {
            await logout();
          },
          danger: true,
        },
        {
          icon: "trash-outline",
          label: "Eliminar cuenta",
          subtitle: "Esta acción es irreversible",
          onPress: () => navigation.navigate("DeleteAccount"),
          danger: true,
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      <Header title="Ajustes" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <GlassCard variant="surface">
              {section.items.map((item, idx) => (
                <Pressable
                  key={item.label}
                  style={[
                    styles.row,
                    idx < section.items.length - 1 && styles.rowBorder,
                  ]}
                  onPress={item.onPress}
                >
                  <Ionicons name={item.icon} size={22} color={item.danger ? "#FF4B4B" : colors.eu.star} />
                  <View style={styles.rowContent}>
                    <Text
                      style={[
                        styles.rowLabel,
                        item.danger && styles.dangerText,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.subtitle && (
                      <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
                </Pressable>
              ))}
            </GlassCard>
          </View>
        ))}

        {/* App info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Eramix</Text>
          <Text style={styles.appVersion}>v1.0.0</Text>
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.small.fontSize,
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm + 4,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  rowEmoji: {
    fontSize: 22,
    marginRight: spacing.md,
  },
  rowContent: { flex: 1 },
  rowLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  rowSubtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.small.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  rowArrow: {
    fontSize: 22,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  dangerText: {
    color: colors.status.error,
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  appName: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
  },
  appVersion: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.small.fontSize,
    color: colors.text.disabled,
    marginTop: spacing.xxs,
  },
});
