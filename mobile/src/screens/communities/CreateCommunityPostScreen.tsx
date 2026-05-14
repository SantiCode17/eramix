import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  radii,
} from "@/design-system/tokens";
import { ScreenBackground } from "@/design-system/components";
import * as communitiesApi from "@/api/communities";
import { handleError } from "@/utils/errorHandler";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";

type CommunitiesStackParamList = {
  CreateCommunityPost: { communityId: number };
};
type RouteType = RouteProp<CommunitiesStackParamList, "CreateCommunityPost">;

const MAX_CONTENT = 2000;

export default function CreateCommunityPostScreen(): React.JSX.Element {
  const route = useRoute<RouteType>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { communityId } = route.params;

  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      let uploadedUrl: string | undefined;
      if (imageUri) {
        setUploading(true);
        uploadedUrl = await communitiesApi.uploadPostImage(communityId, imageUri);
        setUploading(false);
      }
      await communitiesApi.createPost(communityId, {
        content: content.trim(),
        imageUrl: uploadedUrl,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (e) {
      handleError(e, "CreatePost.submit");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  }, [content, imageUri, communityId, navigation]);

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ flex: 1, paddingTop: insets.top }}>
          {/* Header */}
          <View style={st.header}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </Pressable>
            <Text style={st.headerTitle}>Nueva publicación</Text>
            <Pressable
              onPress={handleSubmit}
              disabled={!content.trim() || submitting}
              style={[st.publishBtn, (!content.trim() || submitting) && st.publishBtnDisabled]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.eu.star} />
              ) : (
                <Text style={st.publishText}>Publicar</Text>
              )}
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={st.body}
            showsVerticalScrollIndicator={false}
          >
            {/* Text input */}
            <Animated.View entering={FadeInDown.duration(300)}>
              <TextInput
                style={st.textInput}
                value={content}
                onChangeText={setContent}
                placeholder="¿Qué quieres compartir?"
                placeholderTextColor={colors.text.tertiary}
                multiline
                maxLength={MAX_CONTENT}
                textAlignVertical="top"
              />
              <Text style={st.charCount}>
                {content.length}/{MAX_CONTENT}
              </Text>
            </Animated.View>

            {/* Image preview */}
            {imageUri && (
              <Animated.View entering={FadeIn.duration(300)} style={st.imagePreview}>
                <Image
                  source={{ uri: imageUri }}
                  style={st.previewImage}
                  resizeMode="cover"
                />
                <Pressable
                  style={st.removeImage}
                  onPress={() => setImageUri(null)}
                >
                  <Ionicons name="close-circle" size={28} color={colors.status.error} />
                </Pressable>
                {uploading && (
                  <View style={st.uploadOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                  </View>
                )}
              </Animated.View>
            )}

            {/* Add image button */}
            {!imageUri && (
              <Pressable style={st.addImageBtn} onPress={pickImage}>
                <Ionicons name="image-outline" size={22} color={colors.eu.star} />
                <Text style={st.addImageText}>Añadir imagen</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h4.fontSize,
    color: colors.text.primary,
  },
  publishBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,215,0,0.15)",
  },
  publishBtnDisabled: { opacity: 0.4 },
  publishText: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.eu.star,
  },

  /* Body */
  body: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  textInput: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
    lineHeight: typography.sizes.body.lineHeight,
    minHeight: 160,
    backgroundColor: colors.glass.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.md,
  },
  charCount: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
    textAlign: "right",
    marginTop: spacing.xs,
  },

  /* Image preview */
  imagePreview: {
    marginTop: spacing.md,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: radii.lg,
  },
  removeImage: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay.medium,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radii.lg,
  },

  /* Add image */
  addImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.glass.white,
    borderWidth: 1,
    borderColor: colors.glass.border,
    alignSelf: "flex-start",
  },
  addImageText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.body.fontSize,
    color: colors.eu.star,
  },
});
