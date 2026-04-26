import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Switch } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { GlassCard, Header } from "@/design-system/components";
import { colors, typography, spacing, DS } from "@/design-system/tokens";

interface PrivacySetting {
  key: string;
  label: string;
  description: string;
  value: boolean;
}

export default function PrivacySettingsScreen(): React.JSX.Element {
  const navigation = useNavigation();

  const [settings, setSettings] = useState<PrivacySetting[]>([
    {
      key: "showLocation",
      label: "Mostrar ubicación",
      description: "Otros usuarios podrán ver tu ciudad de destino",
      value: true,
    },
    {
      key: "showOnline",
      label: "Mostrar estado en línea",
      description: "Muestra cuándo estuviste activo por última vez",
      value: true,
    },
    {
      key: "showUniversity",
      label: "Mostrar universidad",
      description: "Tu universidad será visible en tu perfil",
      value: true,
    },
    {
      key: "allowFriendRequests",
      label: "Permitir solicitudes de amistad",
      description: "Cualquiera puede enviarte solicitudes",
      value: true,
    },
    {
      key: "showInSearch",
      label: "Aparecer en búsquedas",
      description: "Otros Erasmus podrán encontrarte",
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
        colors={[DS.background, "#0E1A35", "#0F1535"]}
        style={StyleSheet.absoluteFill}
      />

      <Header title="Privacidad" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.info}>
          Controla quién puede ver tu información y cómo interactúan contigo.
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
    borderBottomWidth: StyleSheet.hairlineWidth,
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
