import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import * as Haptics from "expo-haptics";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { CommunitiesStackParamList } from "@/types/communities";
import * as communitiesApi from "@/api/communities";
import { handleError } from "@/utils/errorHandler";

type ScreenRoute = RouteProp<CommunitiesStackParamList, "CreateCommunityPost">;
type Nav = StackNavigationProp<CommunitiesStackParamList, "CreateCommunityPost">;

export default function CreateCommunityPostScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<ScreenRoute>();
  const insets = useSafeAreaInsets();
  const { communityId } = route.params;

  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = content.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitting(true);
    try {
      await communitiesApi.createPost(communityId, {
        content: content.trim(),
        imageUrl: imageUrl.trim() || undefined,
      });
      nav.goBack();
    } catch (e: any) {
      Alert.alert("Error", handleError(e, "CreateCommunityPost.submit"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.background.start, colors.background.end]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 22 }}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Nueva publicación</Text>
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.text.inverse} />
          ) : (
            <Text
              style={[
                styles.submitText,
                !canSubmit && styles.submitTextDisabled,
              ]}
            >
              Publicar
            </Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          {/* Content */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>¿Qué quieres compartir?</Text>
            <TextInput
              style={[styles.textArea, { minHeight: 160 }]}
              multiline
              textAlignVertical="top"
              placeholder="Escribe tu publicación..."
              placeholderTextColor={colors.text.disabled}
              value={content}
              onChangeText={setContent}
              maxLength={5000}
            />
            <Text style={styles.charCount}>{content.length}/5000</Text>
          </View>

          {/* Optional image */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Imagen (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="URL de la imagen"
              placeholderTextColor={colors.text.disabled}
              value={imageUrl}
              onChangeText={setImageUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// ── Styles ──────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: typography.families.subheading,
    ...typography.sizes.body,
    color: colors.text.primary,
  },
  submitBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.eu.star,
  },
  submitBtnDisabled: {
    backgroundColor: colors.glass.white,
  },
  submitText: {
    fontFamily: typography.families.bodyBold,
    ...typography.sizes.caption,
    color: colors.text.inverse,
  },
  submitTextDisabled: {
    color: colors.text.disabled,
  },
  form: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  inputGroup: { gap: spacing.xs },
  label: {
    fontFamily: typography.families.subheading,
    ...typography.sizes.caption,
    color: colors.text.primary,
  },
  input: {
    backgroundColor: colors.glass.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.families.body,
    ...typography.sizes.body,
    color: colors.text.primary,
  },
  textArea: {
    backgroundColor: colors.glass.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.families.body,
    ...typography.sizes.body,
    color: colors.text.primary,
  },
  charCount: {
    fontFamily: typography.families.body,
    ...typography.sizes.bodySmall,
    color: colors.text.secondary,
    textAlign: "right",
  },
});
