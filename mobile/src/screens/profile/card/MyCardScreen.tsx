import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";

import { ScreenBackground } from "@/design-system";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import { FlipUserCard, FLIP_CARD_HEIGHT } from "@/screens/discover/components";
import { useMyProfile } from "@/hooks/useProfileQuery";
import { toProfileCardUser } from "../utils/profileCardUser";

const FRAMES = [
  { id: "gold", label: "EU Gold", border: "rgba(255,215,0,0.5)", glow: "rgba(255,215,0,0.22)" },
  { id: "teal", label: "Aurora", border: "rgba(79,209,197,0.52)", glow: "rgba(79,209,197,0.22)" },
  { id: "orange", label: "Sunset", border: "rgba(255,140,53,0.52)", glow: "rgba(255,140,53,0.22)" },
  { id: "ice", label: "Ice", border: "rgba(145,179,255,0.55)", glow: "rgba(145,179,255,0.2)" },
] as const;

const BADGES = ["Global Buddy", "Campus Insider", "Food Explorer", "Weekend Wanderer", "Language Mixer"];

export default function MyCardScreen(): React.JSX.Element {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { data: profile } = useMyProfile();

  const [frameId, setFrameId] = useState<(typeof FRAMES)[number]["id"]>("gold");
  const [badge, setBadge] = useState(BADGES[0]);
  const [headline, setHeadline] = useState("Conecta conmigo para planes Erasmus");

  const cardUser = useMemo(() => toProfileCardUser(profile), [profile]);
  const selectedFrame = FRAMES.find((frame) => frame.id === frameId) ?? FRAMES[0];

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Tarjeta guardada", "Tu configuración visual se ha actualizado.");
  };

  return (
    <ScreenBackground>
      <View style={[st.header, { paddingTop: insets.top + 8 }]}> 
        <Pressable onPress={() => navigation.goBack()} style={st.headerBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
        </Pressable>
        <Text style={st.headerTitle}>Crear tarjeta</Text>
        <Pressable onPress={handleSave} style={st.headerBtn}>
          <Ionicons name="checkmark" size={22} color={colors.eu.star} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[st.scroll, { paddingBottom: Math.max(insets.bottom, 18) + 90 }]} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(80).springify()} style={st.heroCard}>
          <View style={st.heroPill}>
            <Ionicons name="diamond-outline" size={12} color={colors.eu.star} />
            <Text style={st.heroPillText}>PROFILE STUDIO</Text>
          </View>
          <Text style={st.heroTitle}>Misma tarjeta que en Inicio</Text>
          <Text style={st.heroSubtitle}>
            Diseña tu presencia sin alterar la forma oficial. Lo que ves aquí es exactamente lo que aparece en Inicio y Discover.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(140).springify()}
          style={[
            st.previewFrame,
            {
              borderColor: selectedFrame.border,
              shadowColor: selectedFrame.glow,
            },
          ]}
        >
          <View style={st.cardWrap}>
            <FlipUserCard user={cardUser} />
          </View>
          <View style={st.previewLegend}>
            <Ionicons name="sync-outline" size={14} color={colors.text.tertiary} />
            <Text style={st.previewLegendText}>Toca la tarjeta para verla por detrás</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(210).springify()} style={st.section}>
          <Text style={st.sectionTitle}>Marco visual</Text>
          <View style={st.frameRow}>
            {FRAMES.map((frame) => {
              const active = frame.id === frameId;
              return (
                <Pressable
                  key={frame.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFrameId(frame.id);
                  }}
                  style={[st.frameOption, active && st.frameOptionActive]}
                >
                  <View style={[st.frameDot, { backgroundColor: frame.border }]} />
                  <Text style={[st.frameLabel, active && st.frameLabelActive]}>{frame.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(280).springify()} style={st.section}>
          <Text style={st.sectionTitle}>Badge de perfil</Text>
          <View style={st.badgeRow}>
            {BADGES.map((label) => {
              const active = label === badge;
              return (
                <Pressable
                  key={label}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setBadge(label);
                  }}
                  style={[st.badgeChip, active && st.badgeChipActive]}
                >
                  <Text style={[st.badgeText, active && st.badgeTextActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(340).springify()} style={st.section}>
          <Text style={st.sectionTitle}>Titular de tarjeta</Text>
          <TextInput
            value={headline}
            onChangeText={setHeadline}
            style={st.input}
            maxLength={80}
            placeholder="Escribe tu frase de presentación"
            placeholderTextColor={colors.text.tertiary}
          />
          <View style={st.livePreview}>
            <Ionicons name="sparkles-outline" size={16} color={colors.eu.star} />
            <Text style={st.livePreviewText}>{headline.trim() || "Sin titular"}</Text>
          </View>
          <View style={st.livePreview}>
            <Ionicons name="ribbon-outline" size={16} color={colors.eu.star} />
            <Text style={st.livePreviewText}>{badge}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()} style={st.quickTips}>
          <Text style={st.quickTipsTitle}>Tips para que destaque</Text>
          <Text style={st.quickTipsText}>• Usa un titular corto y concreto (máximo 8-10 palabras).</Text>
          <Text style={st.quickTipsText}>• Combina marco y badge según tu personalidad Erasmus.</Text>
          <Text style={st.quickTipsText}>• Revisa la cara trasera para validar bio, idiomas e intereses.</Text>
        </Animated.View>
      </ScrollView>

      <View style={[st.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}> 
        <Pressable onPress={handleSave} style={st.saveBtn}>
          <Text style={st.saveBtnText}>Guardar tarjeta</Text>
        </Pressable>
      </View>
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: 18,
    color: colors.text.primary,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  heroCard: {
    borderRadius: radii.lg,
    padding: spacing.md,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  heroPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.24)",
    backgroundColor: "rgba(255,215,0,0.08)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginBottom: 8,
  },
  heroPillText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 10,
    color: colors.eu.star,
    letterSpacing: 0.7,
  },
  heroTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 16,
    color: colors.text.primary,
  },
  heroSubtitle: {
    marginTop: 6,
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
  },
  previewFrame: {
    padding: spacing.xs,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    backgroundColor: "rgba(255,255,255,0.02)",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  cardWrap: {
    width: "100%",
    height: FLIP_CARD_HEIGHT,
  },
  previewLegend: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
  },
  previewLegendText: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  section: {
    borderRadius: radii.xl,
    padding: spacing.md,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 14,
    color: colors.text.primary,
  },
  frameRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  frameOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  frameOptionActive: {
    borderColor: "rgba(255,215,0,0.4)",
    backgroundColor: "rgba(255,215,0,0.1)",
  },
  frameDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  frameLabel: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.secondary,
  },
  frameLabelActive: {
    color: colors.eu.star,
    fontFamily: typography.families.bodyMedium,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  badgeChip: {
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  badgeChipActive: {
    borderColor: "rgba(255,215,0,0.35)",
    backgroundColor: "rgba(255,215,0,0.08)",
  },
  badgeText: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.secondary,
  },
  badgeTextActive: {
    color: colors.eu.star,
    fontFamily: typography.families.bodyMedium,
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: typography.families.body,
    fontSize: 14,
    color: colors.text.primary,
  },
  livePreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  livePreviewText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.text.primary,
  },
  quickTips: {
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
    gap: 6,
  },
  quickTipsTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 14,
    color: colors.text.primary,
  },
  quickTipsText: {
    fontFamily: typography.families.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text.secondary,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: "rgba(4,6,26,0.9)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  saveBtn: {
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.eu.star,
    paddingVertical: 14,
  },
  saveBtnText: {
    fontFamily: typography.families.subheading,
    fontSize: 15,
    color: "#0A1628",
  },
});
