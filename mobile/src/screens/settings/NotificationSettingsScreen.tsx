import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Switch } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { GlassCard, Header } from "@/design-system/components";
import { colors, typography, spacing } from "@/design-system/tokens";

interface NotificationSetting {
  key: string;
  label: string;
  description: string;
  value: boolean;
}

export default function NotificationSettingsScreen(): React.JSX.Element {
  const navigation = useNavigation();

  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      key: "friendRequests",
      label: "Solicitudes de amistad",
      description: "Cuando alguien quiere ser tu amigo",
      value: true,
    },
    {
      key: "messages",
      label: "Mensajes",
      description: "Nuevos mensajes de chat",
      value: true,
    },
    {
      key: "events",
      label: "Eventos",
      description: "Nuevos eventos y recordatorios",
      value: true,
    },
    {
      key: "nearby",
      label: "Erasmus cercanos",
      description: "Cuando hay Erasmus cerca de ti",
      value: false,
    },
    {
      key: "stories",
      label: "Stories",
      description: "Cuando tus amigos publican stories",
      value: true,
    },
  ]);

  const toggle = (key: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value: !s.value } : s)),
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      <Header title="Notificaciones" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.info}>
          Elige qué notificaciones quieres recibir.
        </Text>

        <GlassCard variant="surface">
          {settings.map((setting, idx) => (
            <View
              key={setting.key}
              style={[
                styles.row,
                idx < settings.length - 1 && styles.rowBorder,
              ]}
            >
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>{setting.label}</Text>
                <Text style={styles.rowDescription}>{setting.description}</Text>
              </View>
              <Switch
                value={setting.value}
                onValueChange={() => toggle(setting.key)}
                trackColor={{
                  false: "rgba(255,255,255,0.15)",
                  true: colors.eu.deep,
                }}
                thumbColor={setting.value ? colors.eu.star : colors.text.disabled}
              />
            </View>
          ))}
        </GlassCard>

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
  info: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm + 2,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  rowContent: { flex: 1, marginRight: spacing.md },
  rowLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  rowDescription: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
});
