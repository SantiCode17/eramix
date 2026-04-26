/**
 * ════════════════════════════════════════════════════════════════
 *  CardCustomizeScreen — Card Theme Studio
 *
 *  • Full theme preview grid
 *  • Accent color picker
 *  • Layout options (classic, minimal, bold)
 *  • Live mini-preview of the card
 * ════════════════════════════════════════════════════════════════
 */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import type { StackScreenProps } from "@react-navigation/stack";

import { ScreenBackground, GlassCard } from "@/design-system";
import { colors, typography, spacing, DS } from "@/design-system/tokens";
import type { ProfileStackParamList } from "@/types";

type Props = StackScreenProps<ProfileStackParamList, "CardCustomize">;

const THEMES: { name: string; colors: [string, string, string]; icon: string }[] = [
  { name: "Obsidian",  colors: ["#0F1923", "#1A2A3C", "#0F1923"], icon: "moon-outline" },
  { name: "Aurora",    colors: ["#0A2342", "#134E5E", "#0A2342"], icon: "planet-outline" },
  { name: "Sunset",    colors: ["#2D1B42", "#4A1942", "#2D1B42"], icon: "sunny-outline" },
  { name: "Deep Sea",  colors: ["#0B1120", "#142850", "#0B1120"], icon: "water-outline" },
  { name: "Gold Rush", colors: ["#1A1400", "#3D3000", "#1A1400"], icon: "diamond-outline" },
  { name: "Midnight",  colors: ["#0D0D1A", "#1A1A3E", "#0D0D1A"], icon: "star-outline" },
];

const ACCENTS = [
  { name: "Oro", color: "#FFD700" },
  { name: "Naranja", color: "#FF6B2B" },
  { name: "Rosa", color: "#FF4F6F" },
  { name: "Verde", color: "#00D4AA" },
  { name: "Morado", color: "#6C5CE7" },
  { name: "Azul", color: "#00B4D8" },
  { name: "Crema", color: "#F2C464" },
  { name: "Blanco", color: "#FFFFFF" },
];

const LAYOUTS = [
  { name: "Clásico", desc: "Diseño elegante y equilibrado", icon: "grid-outline" },
  { name: "Minimal", desc: "Limpio y minimalista", icon: "remove-outline" },
  { name: "Bold", desc: "Grande y llamativo", icon: "flash-outline" },
];

export default function CardCustomizeScreen({ navigation }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [selectedAccent, setSelectedAccent] = useState(0);
  const [selectedLayout, setSelectedLayout] = useState(0);

  const accent = ACCENTS[selectedAccent].color;
  const theme = THEMES[selectedTheme];

  return (
    <ScreenBackground>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <View style={s.headerBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.text.primary} />
          </View>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Personalizar Tarjeta</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: 40 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Mini Preview */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={s.previewArea}>
          <LinearGradient
            colors={theme.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.previewCard}
          >
            <Text style={[s.previewLogo, { color: accent }]}>ERAMIX</Text>
            <View style={[s.previewCircle, { borderColor: accent }]} />
            <View style={s.previewLines}>
              <View style={[s.previewLine, { backgroundColor: accent, width: 60 }]} />
              <View style={[s.previewLine, { backgroundColor: `${accent}60`, width: 40 }]} />
            </View>
            <View style={[s.cardBorder, { borderColor: `${accent}20` }]} />
          </LinearGradient>
        </Animated.View>

        {/* Themes */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={s.sectionTitle}>Tema</Text>
          <View style={s.themeGrid}>
            {THEMES.map((t, i) => (
              <TouchableOpacity
                key={t.name}
                onPress={() => setSelectedTheme(i)}
                style={s.themeItem}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={t.colors}
                  style={[
                    s.themePreview,
                    selectedTheme === i && { borderColor: accent, borderWidth: 2 },
                  ]}
                >
                  <Ionicons name={t.icon as any} size={20} color={selectedTheme === i ? accent : colors.text.tertiary} />
                </LinearGradient>
                <Text style={[s.themeName, selectedTheme === i && { color: accent }]}>{t.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Accents */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={s.sectionTitle}>Color de acento</Text>
          <GlassCard variant="surface" style={s.accentCard}>
            <View style={s.accentGrid}>
              {ACCENTS.map((a, i) => (
                <TouchableOpacity
                  key={a.color}
                  onPress={() => setSelectedAccent(i)}
                  style={s.accentItem}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      s.accentCircle,
                      { backgroundColor: a.color },
                      selectedAccent === i && { borderWidth: 3, borderColor: "#FFF" },
                    ]}
                  >
                    {selectedAccent === i && (
                      <Ionicons name="checkmark" size={14} color="#0A1628" />
                    )}
                  </View>
                  <Text style={s.accentName}>{a.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Layouts */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Text style={s.sectionTitle}>Diseño</Text>
          {LAYOUTS.map((l, i) => (
            <TouchableOpacity
              key={l.name}
              onPress={() => setSelectedLayout(i)}
              activeOpacity={0.7}
            >
              <GlassCard
                variant="surface"
                style={[
                  s.layoutItem,
                  selectedLayout === i && { borderColor: accent, borderWidth: 1 },
                ]}
              >
                <View style={s.layoutIcon}>
                  <Ionicons
                    name={l.icon as any}
                    size={20}
                    color={selectedLayout === i ? accent : colors.text.tertiary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.layoutName, selectedLayout === i && { color: accent }]}>
                    {l.name}
                  </Text>
                  <Text style={s.layoutDesc}>{l.desc}</Text>
                </View>
                {selectedLayout === i && (
                  <Ionicons name="checkmark-circle" size={20} color={accent} />
                )}
              </GlassCard>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Apply button */}
        <Animated.View entering={FadeInDown.delay(500).springify()} style={{ marginTop: 20 }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.goBack()}
          >
            <LinearGradient
              colors={[accent, `${accent}CC`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.applyBtn}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#0A1628" />
              <Text style={s.applyBtnText}>Aplicar cambios</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </ScreenBackground>
  );
}

/* ═══ Styles ═══ */
const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingBottom: 8 },
  headerBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontFamily: typography.families.subheading, fontSize: typography.sizes.h4.fontSize, color: colors.text.primary },
  scroll: { paddingHorizontal: spacing.md },
  // Preview
  previewArea: { alignItems: "center", marginVertical: 16 },
  previewCard: { width: 160, height: 220, borderRadius: 16, padding: 16, alignItems: "center", justifyContent: "space-between" },
  previewLogo: { fontFamily: typography.families.heading, fontSize: 12, letterSpacing: 3 },
  previewCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 2 },
  previewLines: { alignItems: "center", gap: 4 },
  previewLine: { height: 3, borderRadius: 2 },
  cardBorder: { ...StyleSheet.absoluteFillObject, borderRadius: 16, borderWidth: 1 },
  // Sections
  sectionTitle: { fontFamily: typography.families.subheading, fontSize: 11, color: colors.text.secondary, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10, marginTop: 20, marginLeft: 4 },
  // Themes
  themeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  themeItem: { alignItems: "center", width: "30%" as any },
  themePreview: { width: "100%", aspectRatio: 1.3, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  themeName: { fontFamily: typography.families.body, fontSize: 10, color: colors.text.tertiary, marginTop: 6 },
  // Accents
  accentCard: { padding: 16 },
  accentGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16, justifyContent: "center" },
  accentItem: { alignItems: "center", gap: 4 },
  accentCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  accentName: { fontFamily: typography.families.body, fontSize: 9, color: colors.text.tertiary },
  // Layouts
  layoutItem: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12, marginBottom: 8 },
  layoutIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.04)", justifyContent: "center", alignItems: "center" },
  layoutName: { fontFamily: typography.families.bodyMedium, fontSize: typography.sizes.body.fontSize, color: colors.text.primary },
  layoutDesc: { fontFamily: typography.families.body, fontSize: 11, color: colors.text.tertiary, marginTop: 2 },
  // Apply
  applyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 24 },
  applyBtnText: { fontFamily: typography.families.bodyMedium, fontSize: 14, color: "#0A1628" },
});
