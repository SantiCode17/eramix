import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import * as storiesApi from "@/api/stories";
import { handleError } from "@/utils/errorHandler";
import { colors, typography, spacing, radii } from "@/design-system/tokens";

interface Props {
  onClose: () => void;
}

export default function CreateStoryScreen({
  onClose,
}: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [9, 16],
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!imageUri) {
      Alert.alert("Error", "Selecciona una imagen para tu historia");
      return;
    }
    setSubmitting(true);
    try {
      await storiesApi.createStory(imageUri, caption.trim() || undefined);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } catch (e) {
      Alert.alert("Error", handleError(e, "CreateStory.submit"));
    } finally {
      setSubmitting(false);
    }
  }, [imageUri, caption, onClose]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Nueva Historia</Text>
        <Pressable onPress={handleSubmit} hitSlop={12} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color={colors.eu.star} size="small" />
          ) : (
            <Text
              style={[
                styles.publishText,
                !imageUri && { opacity: 0.4 },
              ]}
            >
              Publicar
            </Text>
          )}
        </Pressable>
      </View>

      {/* Image preview / picker */}
      <Pressable style={styles.imageArea} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : (
          <View style={styles.placeholderArea}>
            <Text style={styles.placeholderEmoji}>📷</Text>
            <Text style={styles.placeholderText}>
              Toca para seleccionar una foto
            </Text>
          </View>
        )}
      </Pressable>

      {/* Caption */}
      <View style={styles.captionRow}>
        <TextInput
          style={styles.captionInput}
          placeholder="Añade un texto... (opcional)"
          placeholderTextColor={colors.text.disabled}
          value={caption}
          onChangeText={setCaption}
          maxLength={200}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  headerTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 18,
    color: colors.text.primary,
  },
  cancelText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 15,
    color: colors.text.secondary,
  },
  publishText: {
    fontFamily: typography.families.subheading,
    fontSize: 15,
    color: colors.eu.star,
  },

  imageArea: {
    flex: 1,
    margin: spacing.lg,
    borderRadius: radii.xl,
    overflow: "hidden",
    backgroundColor: colors.glass.white,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  preview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  placeholderEmoji: { fontSize: 48 },
  placeholderText: {
    fontFamily: typography.families.body,
    fontSize: 15,
    color: colors.text.secondary,
  },

  captionRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  captionInput: {
    backgroundColor: colors.glass.white,
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontFamily: typography.families.body,
    fontSize: 15,
    color: colors.text.primary,
  },
});
