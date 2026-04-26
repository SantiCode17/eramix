/**
 * ════════════════════════════════════════════════════════════════
 *  CreatePostScreen — Publish a Personal Post
 *
 *  • Image picker with multi-select preview
 *  • Rich text input with character counter
 *  • Location tag, mood selector, audience toggle
 *  • Animated toolbar + gradient publish button
 *  • Camera & gallery access
 * ════════════════════════════════════════════════════════════════
 */
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeInDown, FadeIn, FadeOut } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { StackScreenProps } from "@react-navigation/stack";

import { ScreenBackground, Avatar } from "@/design-system";
import { colors, typography, spacing, radii, DS, shadows } from "@/design-system/tokens";
import { createPost, uploadPostImage } from "@/api/communities";
import { useMyProfile } from "@/hooks/useProfileQuery";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import type { ProfileStackParamList } from "@/types";

type Props = StackScreenProps<ProfileStackParamList, "CreatePost">;
const { width: SCREEN_W } = Dimensions.get("window");
const MAX_CONTENT = 600;

const MOODS = [
  { emoji: "😊", label: "Feliz" },
  { emoji: "🎉", label: "De fiesta" },
  { emoji: "✈️", label: "Viajando" },
  { emoji: "📚", label: "Estudiando" },
  { emoji: "🍕", label: "Comiendo" },
  { emoji: "💪", label: "Motivado" },
  { emoji: "🌍", label: "Explorando" },
  { emoji: "❤️", label: "Agradecido" },
];

export default function CreatePostScreen({ route, navigation }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { communityId, editPost } = route.params;
  const { data: profile } = useMyProfile();
  const isEditing = !!editPost;

  const [content, setContent] = useState(editPost?.content ?? "");
  const [images, setImages] = useState<string[]>(
    editPost?.imageUrl ? [resolveMediaUrl(editPost.imageUrl) ?? ""] : []
  );
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [showMoods, setShowMoods] = useState(false);

  const photoUrl = profile?.profilePhotoUrl ? resolveMediaUrl(profile.profilePhotoUrl) : undefined;
  const fullName = `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim();

  const pickImages = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.85,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, 5));
    }
  }, []);

  const takePhoto = useCallback(async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permiso necesario", "Necesitamos acceso a tu cámara");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: true });
    if (!result.canceled && result.assets[0]) {
      setImages((prev) => [...prev, result.assets[0].uri].slice(0, 5));
    }
  }, []);

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const postMut = useMutation({
    mutationFn: async () => {
      const finalContent = selectedMood
        ? `${content}\n\n${selectedMood} — ${MOODS.find((m) => m.emoji === selectedMood)?.label ?? ""}`
        : content;
      const newPost = await createPost(communityId, { content: finalContent.trim() });
      for (const uri of images) {
        if (uri.startsWith("file")) {
          try { await uploadPostImage(communityId, uri); } catch {}
        }
      }
      return newPost;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myPosts"] });
      qc.invalidateQueries({ queryKey: ["communityPosts"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    },
    onError: (err: any) => Alert.alert("Error", err?.message ?? "No se pudo crear la publicación"),
  });

  const canPost = content.trim().length > 0 || images.length > 0;
  const charProgress = content.length / MAX_CONTENT;

  return (
    <ScreenBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* ── Header ── */}
        <View style={[st.header, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={() => navigation.goBack()} style={st.headerBtn}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </Pressable>
          <View style={{ alignItems: "center" }}>
            <Text style={st.headerEyebrow}>PUBLICACIÓN</Text>
            <Text style={st.headerTitle}>{isEditing ? "Editar publicación" : "Subir publicación"}</Text>
          </View>
          <Pressable onPress={() => postMut.mutate()} disabled={!canPost || postMut.isPending}>
            {postMut.isPending ? (
              <ActivityIndicator color={DS.primary} size="small" />
            ) : (
              <LinearGradient
                colors={canPost ? ["#FFD700", "#FF6B2B"] : ["#333", "#333"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={st.publishBtn}
              >
                <Text style={[st.publishTxt, !canPost && { color: "#666" }]}>{isEditing ? "Guardar" : "Publicar"}</Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[st.scroll, { paddingBottom: 40 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Author Row ── */}
          <Animated.View entering={FadeIn.delay(50)} style={st.authorRow}>
            <Avatar name={fullName} uri={photoUrl} size="md" />
            <View style={{ flex: 1 }}>
              <Text style={st.authorName}>{fullName}</Text>
              <View style={st.audienceRow}>
                <Ionicons name="earth-outline" size={12} color={colors.text.tertiary} />
                <Text style={st.audienceTxt}>Público</Text>
              </View>
            </View>
            {selectedMood && (
              <View style={st.moodBadge}>
                <Text style={{ fontSize: 20 }}>{selectedMood}</Text>
              </View>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(75).springify()} style={st.coverCard}>
            <LinearGradient colors={["rgba(255,215,0,0.12)", "rgba(59,107,255,0.08)"]} style={st.coverGlow} />
            <Ionicons name="sparkles-outline" size={15} color={colors.eu.star} />
            <Text style={st.coverText}>Comparte un recuerdo que merezca estar en tu perfil ✨</Text>
          </Animated.View>

          {/* ── Text Input ── */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <TextInput
              style={st.textInput}
              value={content}
              onChangeText={setContent}
              placeholder="¿Qué estás viviendo hoy en tu Erasmus?"
              placeholderTextColor={colors.text.tertiary}
              multiline
              maxLength={MAX_CONTENT}
              autoFocus={!isEditing}
            />
            {/* Character progress bar */}
            <View style={st.progressBar}>
              <View style={[st.progressFill, { width: `${Math.min(charProgress * 100, 100)}%` }, charProgress > 0.9 && { backgroundColor: colors.status.error }]} />
            </View>
            <Text style={[st.charCount, charProgress > 0.9 && { color: colors.status.error }]}>
              {content.length}/{MAX_CONTENT}
            </Text>
          </Animated.View>

          {/* ── Location ── */}
          {location ? (
            <Animated.View entering={FadeInDown} style={st.locationTag}>
              <Ionicons name="location" size={14} color={colors.eu.star} />
              <Text style={st.locationTxt}>{location}</Text>
              <Pressable onPress={() => setLocation("")}>
                <Ionicons name="close-circle" size={16} color={colors.text.tertiary} />
              </Pressable>
            </Animated.View>
          ) : null}

          {/* ── Image Grid ── */}
          {images.length > 0 && (
            <Animated.View entering={FadeInDown.delay(150).springify()} style={st.imageGrid}>
              {images.map((uri, idx) => (
                <View key={idx} style={st.imgWrap}>
                  <Image source={{ uri }} style={st.imgPreview} />
                  <Pressable style={st.imgRemove} onPress={() => removeImage(idx)}>
                    <View style={st.imgRemoveCircle}>
                      <Ionicons name="close" size={14} color="#FFF" />
                    </View>
                  </Pressable>
                </View>
              ))}
              {images.length < 5 && (
                <Pressable style={st.imgAddBtn} onPress={pickImages}>
                  <Ionicons name="add" size={28} color={colors.eu.star} />
                </Pressable>
              )}
            </Animated.View>
          )}

          {/* ── Mood Selector ── */}
          {showMoods && (
            <Animated.View entering={FadeInDown} exiting={FadeOut} style={st.moodGrid}>
              <Text style={st.moodTitle}>¿Cómo te sientes?</Text>
              <View style={st.moodRow}>
                {MOODS.map((m) => (
                  <Pressable
                    key={m.emoji}
                    style={[st.moodItem, selectedMood === m.emoji && st.moodItemActive]}
                    onPress={() => { setSelectedMood(m.emoji === selectedMood ? null : m.emoji); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  >
                    <Text style={{ fontSize: 24 }}>{m.emoji}</Text>
                    <Text style={st.moodLabel}>{m.label}</Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          )}

          {/* ── Toolbar ── */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={st.toolbar}>
            <Pressable onPress={pickImages} style={st.toolItem}>
              <Ionicons name="image-outline" size={22} color={colors.eu.star} />
              <Text style={st.toolTxt}>Galería</Text>
            </Pressable>
            <Pressable onPress={takePhoto} style={st.toolItem}>
              <Ionicons name="camera-outline" size={22} color={colors.text.secondary} />
              <Text style={st.toolTxt}>Cámara</Text>
            </Pressable>
            <Pressable onPress={() => setShowMoods(!showMoods)} style={st.toolItem}>
              <Ionicons name="happy-outline" size={22} color={showMoods ? colors.eu.star : colors.text.secondary} />
              <Text style={st.toolTxt}>Mood</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Alert.prompt?.("Ubicación", "¿Dónde estás?", (t: string) => setLocation(t)) ??
                  setLocation("Erasmus City");
              }}
              style={st.toolItem}
            >
              <Ionicons name="location-outline" size={22} color={location ? colors.eu.star : colors.text.secondary} />
              <Text style={st.toolTxt}>Lugar</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.md, paddingBottom: spacing.sm,
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontFamily: typography.families.heading, fontSize: 18, color: colors.text.primary },
  headerEyebrow: {
    fontFamily: typography.families.body,
    fontSize: 10,
    color: colors.text.tertiary,
    letterSpacing: 1,
  },
  publishBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: radii.full },
  publishTxt: { fontFamily: typography.families.subheading, fontSize: 14, color: "#0A1628" },
  scroll: { paddingHorizontal: spacing.md },

  authorRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg },
  authorName: { fontFamily: typography.families.subheading, fontSize: 16, color: colors.text.primary },
  audienceRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  audienceTxt: { fontFamily: typography.families.body, fontSize: 11, color: colors.text.tertiary },
  moodBadge: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center", justifyContent: "center",
  },
  coverCard: {
    marginBottom: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    overflow: "hidden",
  },
  coverGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  coverText: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 17,
  },

  textInput: {
    fontFamily: typography.families.body, fontSize: 17, color: colors.text.primary,
    lineHeight: 26, minHeight: 120, textAlignVertical: "top",
  },
  progressBar: { height: 2, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 1, marginTop: spacing.sm },
  progressFill: { height: 2, backgroundColor: colors.eu.star, borderRadius: 1 },
  charCount: { fontFamily: typography.families.body, fontSize: 11, color: colors.text.tertiary, textAlign: "right", marginTop: 4 },

  locationTag: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,215,0,0.08)", borderRadius: radii.full,
    paddingHorizontal: 14, paddingVertical: 8, alignSelf: "flex-start", marginTop: spacing.md,
  },
  locationTxt: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.eu.star },

  imageGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.lg },
  imgWrap: { position: "relative" },
  imgPreview: { width: (SCREEN_W - spacing.md * 2 - spacing.sm * 2) / 3, height: (SCREEN_W - spacing.md * 2 - spacing.sm * 2) / 3, borderRadius: radii.lg },
  imgRemove: { position: "absolute", top: 6, right: 6 },
  imgRemoveCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.7)", alignItems: "center", justifyContent: "center" },
  imgAddBtn: {
    width: (SCREEN_W - spacing.md * 2 - spacing.sm * 2) / 3,
    height: (SCREEN_W - spacing.md * 2 - spacing.sm * 2) / 3,
    borderRadius: radii.lg, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.1)",
    borderStyle: "dashed", alignItems: "center", justifyContent: "center",
  },

  moodGrid: { marginTop: spacing.lg },
  moodTitle: { fontFamily: typography.families.subheading, fontSize: 14, color: colors.text.primary, marginBottom: spacing.sm },
  moodRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  moodItem: {
    alignItems: "center", gap: 4, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: radii.lg, backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)",
  },
  moodItemActive: { backgroundColor: "rgba(255,215,0,0.12)", borderColor: colors.eu.star },
  moodLabel: { fontFamily: typography.families.body, fontSize: 10, color: colors.text.secondary },

  toolbar: {
    flexDirection: "row", justifyContent: "space-around", marginTop: spacing.xl,
    paddingVertical: spacing.md, borderTopWidth: 0.5, borderTopColor: "rgba(255,255,255,0.06)",
  },
  toolItem: { alignItems: "center", gap: 4 },
  toolTxt: { fontFamily: typography.families.body, fontSize: 11, color: colors.text.secondary },
});
