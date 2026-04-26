/**
 * ════════════════════════════════════════════════════════════════
 *  EditAboutScreen — Galactic Premium Bio Editor
 *  Animated text area · Character ring · Smart suggestions
 *  Glass card container · EU Gold save CTA
 * ════════════════════════════════════════════════════════════════
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

import { colors, typography, spacing, radii, DS } from "@/design-system/tokens";
import { useAuthStore } from "@/store/useAuthStore";
import { profileApi } from "@/api/profileService";

const MAX_LENGTH = 500;

/* ── Character count ring ── */
function CharRing({ count, max }: { count: number; max: number }) {
  const size = 32;
  const stroke = 2.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(count / max, 1);
  const offset = circumference - pct * circumference;
  const isNear = pct > 0.85;

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isNear ? "#FF4F6F" : colors.eu.star}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      <Text
        style={[
          st.charCount,
          { position: "absolute" },
          isNear && { color: "#FF4F6F" },
        ]}
      >
        {max - count}
      </Text>
    </View>
  );
}

/* ── Suggestion chips ── */
const SUGGESTIONS = [
  "🌍 Erasmus en...",
  "📚 Estudio...",
  "🎶 Me encanta...",
  "⚽ En mi tiempo libre...",
  "🍕 Mi comida favorita es...",
];

export default function EditAboutScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [bio, setBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    try {
      const updated = await profileApi.updateProfile({ bio });
      updateUser(updated);
      navigation.goBack();
    } catch {
      Alert.alert("Error", "No se pudo guardar la bio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={st.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* ── Header ── */}
      <Animated.View entering={FadeIn.duration(300)} style={[st.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => navigation.goBack()} style={st.headerBtn} hitSlop={12}>
          <View style={st.headerBtnCircle}>
            <Ionicons name="arrow-back" size={20} color={colors.text.primary} />
          </View>
        </Pressable>
        <Text style={st.headerTitle}>Sobre mí</Text>
        <View style={st.headerBtn}>
          <CharRing count={bio.length} max={MAX_LENGTH} />
        </View>
      </Animated.View>

      <View style={st.content}>
        {/* ── Prompt ── */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={st.promptCard}>
            <LinearGradient
              colors={["rgba(139,92,246,0.08)", "rgba(139,92,246,0.02)"]}
              style={st.promptGrad}
            >
              <Ionicons name="bulb-outline" size={20} color="#8B5CF6" />
              <Text style={st.promptText}>
                Cuéntale al mundo quién eres. Los perfiles con bio reciben un 40% más de matches.
              </Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* ── Text input ── */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={st.inputCard}>
          <TextInput
            style={st.input}
            multiline
            placeholder="Escribe algo sobre ti..."
            placeholderTextColor="rgba(143,163,188,0.5)"
            value={bio}
            onChangeText={setBio}
            maxLength={MAX_LENGTH}
            autoFocus
            textAlignVertical="top"
          />
          <View style={st.inputFooter}>
            <Text style={st.charLabel}>
              {bio.length}/{MAX_LENGTH} caracteres
            </Text>
          </View>
        </Animated.View>

        {/* ── Suggestion chips ── */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={st.suggestLabel}>Ideas para empezar</Text>
          <View style={st.chipsRow}>
            {SUGGESTIONS.map((s_text) => (
              <Pressable
                key={s_text}
                style={({ pressed }) => [
                  st.chip,
                  pressed && { backgroundColor: "rgba(255,215,0,0.12)" },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setBio((prev) => (prev ? `${prev}\n${s_text}` : s_text));
                }}
              >
                <Text style={st.chipText}>{s_text}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* ── Save button ── */}
        <View style={{ flex: 1 }} />
        <Animated.View entering={FadeInDown.delay(250).springify()}>
          <Pressable
            style={({ pressed }) => [
              st.saveBtn,
              pressed && { transform: [{ scale: 0.97 }] },
              saving && { opacity: 0.6 },
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            <LinearGradient
              colors={["#FFD700", "#FFBA08"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={st.saveBtnGrad}
            >
              <Ionicons name="checkmark" size={20} color="#0A1628" />
              <Text style={st.saveBtnText}>
                {saving ? "Guardando..." : "Guardar"}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerBtn: { width: 44, alignItems: "center" },
  headerBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: 18,
    color: colors.text.primary,
  },
  content: { flex: 1, padding: spacing.lg },

  /* Prompt card */
  promptCard: {
    borderRadius: radii.xl,
    overflow: "hidden",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.15)",
  },
  promptGrad: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
    gap: spacing.sm,
  },
  promptText: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 19,
  },

  /* Input card */
  inputCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  input: {
    fontFamily: typography.families.body,
    fontSize: 16,
    color: colors.text.primary,
    padding: spacing.md,
    minHeight: 140,
    lineHeight: 24,
  },
  inputFooter: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  charLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: "right",
  },
  charCount: {
    fontFamily: typography.families.bodyBold,
    fontSize: 9,
    color: colors.eu.star,
  },

  /* Suggestions */
  suggestLabel: {
    fontFamily: typography.families.subheading,
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  chipText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.text.secondary,
  },

  /* Save */
  saveBtn: {
    borderRadius: radii.full,
    overflow: "hidden",
    marginBottom: spacing.lg,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  saveBtnText: {
    fontFamily: typography.families.heading,
    fontSize: 16,
    color: "#0A1628",
  },
});
