/**
 * ────────────────────────────────────────────────────────
 *  FinanceSettingsScreen.tsx — Configuración financiera (Rediseño)
 * ────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, typography, spacing, radii, DS } from "@/design-system/tokens";
import {
  getNotificationConfig,
  saveNotificationConfig,
  NotificationConfig,
} from "@/services/notificationService";

export default function FinanceSettingsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [config, setConfig] = useState<NotificationConfig>({
    enableNotifications: true,
    enableBudgetAlerts: true,
    alertThreshold: "75",
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const savedConfig = await getNotificationConfig();
      setConfig(savedConfig);
    } catch (error) {
      console.error("[FinanceSettings] Failed to load config:", error);
    }
  };

  const updateConfig = async (updates: Partial<NotificationConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    try {
      await saveNotificationConfig(newConfig);
    } catch (error) {
      console.error("[FinanceSettings] Failed to save config:", error);
    }
  };

  const thresholds: { value: "75" | "90" | "100"; label: string; icon: string; desc: string }[] = [
    { value: "75", label: "Preventivo", icon: "shield-checkmark", desc: "Alerta al 75%" },
    { value: "90", label: "Moderado", icon: "alert-circle", desc: "Alerta al 90%" },
    { value: "100", label: "Límite", icon: "warning", desc: "Al exceder" },
  ];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[DS.background, "#0E1A35", "#0F1535"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header with back arrow */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(50)} style={styles.profileCard}>
          <BlurView intensity={25} tint="dark" style={styles.profileBlur}>
            <LinearGradient
              colors={["rgba(255,215,0,0.08)", "rgba(255,215,0,0.02)"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.profileIcon}>
              <Ionicons name="wallet" size={28} color="#FFD700" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileTitle}>Tu perfil financiero</Text>
              <Text style={styles.profileSubtitle}>
                Personaliza las alertas y notificaciones de tu presupuesto Erasmus
              </Text>
            </View>
          </BlurView>
        </Animated.View>

        {/* Notifications Section */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.sectionLabel}>NOTIFICACIONES</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: "rgba(52,199,89,0.12)" }]}>
                  <Ionicons name="notifications" size={20} color="#34C759" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingTitle}>Notificaciones</Text>
                  <Text style={styles.settingDesc}>Alertas sobre tu presupuesto</Text>
                </View>
              </View>
              <Switch
                value={config.enableNotifications}
                onValueChange={(v) => updateConfig({ enableNotifications: v })}
                trackColor={{ false: "rgba(255,255,255,0.1)", true: "rgba(255,215,0,0.4)" }}
                thumbColor={config.enableNotifications ? "#FFD700" : "#888"}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: "rgba(255,149,0,0.12)" }]}>
                  <Ionicons name="pie-chart" size={20} color="#FF9500" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingTitle}>Alertas de presupuesto</Text>
                  <Text style={styles.settingDesc}>Aviso al alcanzar el límite</Text>
                </View>
              </View>
              <Switch
                value={config.enableBudgetAlerts}
                onValueChange={(v) => updateConfig({ enableBudgetAlerts: v })}
                trackColor={{ false: "rgba(255,255,255,0.1)", true: "rgba(255,215,0,0.4)" }}
                thumbColor={config.enableBudgetAlerts ? "#FFD700" : "#888"}
                disabled={!config.enableNotifications}
              />
            </View>
          </View>
        </Animated.View>

        {/* Threshold Section */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={styles.sectionLabel}>UMBRAL DE ALERTA</Text>
          <View style={styles.thresholdGrid}>
            {thresholds.map((t) => {
              const isActive = config.alertThreshold === t.value;
              return (
                <Pressable
                  key={t.value}
                  style={[styles.thresholdCard, isActive && styles.thresholdCardActive]}
                  onPress={() => updateConfig({ alertThreshold: t.value })}
                >
                  <View style={[styles.thresholdIconWrap, isActive && styles.thresholdIconWrapActive]}>
                    <Ionicons
                      name={t.icon as any}
                      size={24}
                      color={isActive ? "#FFD700" : colors.text.tertiary}
                    />
                  </View>
                  <Text style={[styles.thresholdLabel, isActive && styles.thresholdLabelActive]}>
                    {t.label}
                  </Text>
                  <Text style={styles.thresholdDesc}>{t.desc}</Text>
                  {isActive && (
                    <View style={styles.activeIndicator}>
                      <Ionicons name="checkmark-circle" size={16} color="#FFD700" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Currency Section */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={styles.sectionLabel}>MONEDA</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: "rgba(90,200,250,0.12)" }]}>
                  <Ionicons name="cash" size={20} color="#5AC8FA" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingTitle}>Moneda base</Text>
                  <Text style={styles.settingDesc}>Conversiones automáticas a esta moneda</Text>
                </View>
              </View>
              <View style={styles.currencyBadge}>
                <Text style={styles.currencyText}>EUR €</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Info Cards */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <Text style={styles.sectionLabel}>INFORMACIÓN</Text>
          <View style={styles.infoCard}>
            <View style={[styles.infoIconWrap, { backgroundColor: "rgba(52,199,89,0.12)" }]}>
              <Ionicons name="bulb" size={20} color="#34C759" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Cómo funcionan las alertas</Text>
              <Text style={styles.infoText}>
                Se generan automáticamente al registrar transacciones en categorías
                con presupuesto. Recibirás una notificación según el umbral configurado.
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={[styles.infoIconWrap, { backgroundColor: "rgba(255,215,0,0.12)" }]}>
              <Ionicons name="sparkles" size={20} color="#FFD700" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Consejos para tu presupuesto</Text>
              <Text style={styles.infoText}>
                Establece presupuestos por categoría y revisa tu burn rate diario
                para evitar sorpresas a final de mes.
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h2.fontSize,
    color: colors.text.primary,
  },
  content: { paddingHorizontal: spacing.lg },
  profileCard: {
    borderRadius: radii.xl,
    overflow: "hidden",
    marginBottom: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,215,0,0.15)",
  },
  profileBlur: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  profileIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,215,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
    marginBottom: 4,
  },
  profileSubtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  sectionLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: colors.text.tertiary,
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: spacing.xl,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  settingTitle: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
    marginBottom: 2,
  },
  settingDesc: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: spacing.md,
  },
  thresholdGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  thresholdCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.06)",
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.sm,
  },
  thresholdCardActive: {
    borderColor: "rgba(255,215,0,0.4)",
    backgroundColor: "rgba(255,215,0,0.06)",
  },
  thresholdIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  thresholdIconWrapActive: {
    backgroundColor: "rgba(255,215,0,0.15)",
  },
  thresholdLabel: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
    textAlign: "center",
  },
  thresholdLabelActive: { color: "#FFD700" },
  thresholdDesc: {
    fontFamily: typography.families.body,
    fontSize: 10,
    color: colors.text.tertiary,
    textAlign: "center",
    lineHeight: 14,
  },
  activeIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  currencyBadge: {
    backgroundColor: "rgba(255,215,0,0.12)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  currencyText: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: "#FFD700",
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.06)",
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.md,
    alignItems: "flex-start",
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  infoTitle: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.primary,
    marginBottom: 4,
  },
  infoText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
    lineHeight: 18,
  },
});
