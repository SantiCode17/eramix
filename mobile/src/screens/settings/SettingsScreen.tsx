import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radii, DS } from "@/design-system/tokens";
import { ScreenBackground } from "@/design-system/components";
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
  const insets = useSafeAreaInsets();

  const sections: { title: string; items: SettingsItem[] }[] = [
    {
      title: "Descubrimiento",
      items: [
        {
          icon: "options-outline",
          label: "Preferencias",
          subtitle: "Edad, distancia y filtros",
          onPress: () => navigation.navigate("PrivacySettings"), // Route to be implemented
        },
      ],
    },
    {
      title: "Cuenta y Privacidad",
      items: [
        {
          icon: "lock-closed-outline",
          label: "Privacidad y Seguridad",
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
    <ScreenBackground>
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {/* Header */}
        <View style={st.header}>
          <Pressable
            onPress={() => navigation.getParent()?.goBack()}
            style={st.backBtn}
            hitSlop={12}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </Pressable>
          <Text style={st.headerTitle}>Ajustes</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={st.scrollContent}>
          {sections.map((section) => (
            <View key={section.title} style={st.section}>
              <Text style={st.sectionTitle}>{section.title}</Text>
              <View style={st.card}>
                {section.items.map((item, idx) => (
                  <Pressable
                    key={item.label}
                    style={[
                      st.row,
                      idx < section.items.length - 1 && st.rowBorder,
                    ]}
                    onPress={item.onPress}
                  >
                    <View style={st.iconWrap}>
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={item.danger ? colors.status.error : colors.eu.star}
                      />
                    </View>
                    <View style={st.rowContent}>
                      <Text
                        style={[st.rowLabel, item.danger && st.dangerText]}
                      >
                        {item.label}
                      </Text>
                      {item.subtitle && (
                        <Text style={st.rowSubtitle}>{item.subtitle}</Text>
                      )}
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.text.tertiary}
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          {/* App info */}
          <View style={st.appInfo}>
            <Text style={st.appName}>Eramix</Text>
            <Text style={st.appVersion}>v1.0.0</Text>
          </View>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </View>
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.glass.white,
    borderWidth: 1,
    borderColor: colors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
  },

  /* Section */
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.glass.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glass.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glass.white,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
    marginTop: 2,
  },
  dangerText: { color: colors.status.error },

  /* App info */
  appInfo: { alignItems: "center", paddingVertical: spacing.xl },
  appName: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
  },
  appVersion: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});
