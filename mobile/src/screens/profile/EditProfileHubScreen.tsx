/**
 * ════════════════════════════════════════════════════════════════
 *  EditProfileHubScreen — Galactic Premium Hub
 *  Draggable photo grid · Glass section list · Animated header
 *  EU Gold accents · Smooth micro-interactions
 * ════════════════════════════════════════════════════════════════
 */
import React, { useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeInDown, FadeIn, ZoomIn } from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { colors, typography, spacing, radii, DS } from "@/design-system/tokens";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import { useAuthStore } from "@/store/useAuthStore";
import { profileApi } from "@/api/profileService";
import { SortableGrid } from "@/components/SortableGrid";
import { SortableHorizontalList } from "@/components/SortableHorizontalList";

const { width: SW } = Dimensions.get("window");
const PHOTO_GAP = 8;
const PHOTO_COL = 3;
const PHOTO_SIZE = (SW - spacing.lg * 2 - PHOTO_GAP * (PHOTO_COL - 1)) / PHOTO_COL;

export default function EditProfileHubScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const slideOrder = useAuthStore((s) => s.slideOrder);
  const setSlideOrder = useAuthStore((s) => s.setSlideOrder);
  const [uploading, setUploading] = useState(false);

  /* ── Refresh on focus ── */
  useFocusEffect(
    useCallback(() => {
      profileApi.getMyProfile().then((u) => updateUser(u)).catch(() => {});
    }, [updateUser])
  );

  const photos = user?.photos || [];
  const emptySlotCount = Math.max(0, 9 - photos.length);

  /* ── Compute slides ── */
  const slides = useMemo(() => {
    if (!user) return [];
    const built: Array<{ id: string; label: string; icon: any; color: string; bg: string }> = [];

    if (user.photos?.[0] || user.profilePhotoUrl) {
      built.push({ id: "main_photo", label: "Principal", icon: "image", color: "#FFD700", bg: "rgba(255,215,0,0.15)" });
    }
    if (user.interests?.length || user.bio) {
      built.push({ id: "interests", label: "Intereses", icon: "sparkles", color: "#FF4F6F", bg: "rgba(255,79,111,0.15)" });
    }
    if (user.favoriteSong || user.favoriteFood || user.specialHobby) {
      built.push({ id: "favorites", label: "Favoritos", icon: "heart", color: "#E11D48", bg: "rgba(225,29,72,0.15)" });
    }
    if (user.customPrompts) {
      try {
        const p = JSON.parse(user.customPrompts);
        if (Array.isArray(p) && p.length) {
          built.push({ id: "prompts", label: "Estilo de vida", icon: "chatbubble-ellipses", color: "#8B5CF6", bg: "rgba(139,92,246,0.15)" });
        }
      } catch {}
    }
    if (user.photos && user.photos.length > 1) {
      user.photos.slice(1).forEach((_, idx) => {
        built.push({ id: `photo_${idx + 1}`, label: `Foto ${idx + 2}`, icon: "image-outline", color: "#00D68F", bg: "rgba(0,214,143,0.15)" });
      });
    }

    if (slideOrder && slideOrder.length > 0) {
      built.sort((a, b) => {
        const ia = slideOrder.indexOf(a.id);
        const ib = slideOrder.indexOf(b.id);
        if (ia === -1 && ib === -1) return 0;
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
    } else if (built.length > 0) {
      setTimeout(() => setSlideOrder(built.map((b) => b.id)), 0);
    }
    return built;
  }, [user, slideOrder, setSlideOrder]);
  /* ── Pick & upload photo ── */
  const handleAddPhoto = async (displayOrder: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      try {
        await profileApi.addPhoto(result.assets[0].uri, displayOrder);
        const refreshed = await profileApi.getMyProfile();
        updateUser(refreshed);
      } catch (err) {
        console.warn("Photo upload failed:", err);
      } finally {
        setUploading(false);
      }
    }
  };

  /* ── Delete photo ── */
  const handleDeletePhoto = (photoId: number) => {
    Alert.alert("Eliminar foto", "¿Seguro que quieres eliminar esta foto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          try {
            await profileApi.deletePhoto(photoId);
            const refreshed = await profileApi.getMyProfile();
            updateUser(refreshed);
          } catch {
            console.warn("Photo delete failed");
          }
        },
      },
    ]);
  };

  /* ── Reorder photos ── */
  const handleReorderPhotos = async (newPhotos: typeof photos) => {
    Haptics.selectionAsync();
    if (user) updateUser({ ...user, photos: newPhotos } as any);
    try {
      await profileApi.reorderPhotos(newPhotos.map((p, i) => ({ photoId: p.id, order: i })));
    } catch {
      const refreshed = await profileApi.getMyProfile().catch(() => null);
      if (refreshed) updateUser(refreshed);
    }
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* ═══ HEADER ═══ */}
      <Animated.View entering={FadeIn.duration(300)} style={s.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={s.headerBtn}
          hitSlop={12}
        >
          <View style={s.headerBtnCircle}>
            <Ionicons name="close" size={22} color={colors.text.primary} />
          </View>
        </Pressable>
        <Text style={s.headerTitle}>Tu perfil</Text>
        <Pressable
          style={s.headerBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate("ProfilePreview");
          }}
        >
          <View style={s.headerBtnCircle}>
            <Ionicons name="eye-outline" size={18} color={colors.eu.star} />
          </View>
        </Pressable>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* ═══ PHOTOS GRID ═══ */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={s.gridSectionHeader}>
            <Ionicons name="images-outline" size={18} color={colors.eu.star} />
            <Text style={s.gridSectionTitle}>Tus fotos</Text>
            <Text style={s.gridSectionCount}>{photos.length}/9</Text>
          </View>

          <GestureHandlerRootView>
            <View style={{ position: "relative", minHeight: Math.ceil(9 / PHOTO_COL) * (PHOTO_SIZE * 1.35 + PHOTO_GAP) }}>
              {/* Empty background grid to show placeholders */}
              <View style={[s.gridContainer, { position: "absolute", top: 0, left: 0, right: 0 }]}>
                {Array.from({ length: 9 }).map((_, i) => {
                  const hideEmpty = i < photos.length;
                  return (
                    <Pressable
                      key={`empty-${i}`}
                      style={[s.photoCell, hideEmpty && { opacity: 0 }]}
                      onPress={() => !hideEmpty && handleAddPhoto(i)}
                      disabled={hideEmpty}
                    >
                      <View style={s.addPhotoInner}>
                        <View style={s.addPhotoCircle}>
                          <Ionicons name="add" size={22} color={colors.eu.star} />
                        </View>
                        <Text style={s.addPhotoText}>Añadir</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {/* Foreground Sortable grid */}
              {photos.length > 0 && (
                <SortableGrid
                  data={photos}
                  keyExtractor={(p) => String(p.id)}
                  itemWidth={PHOTO_SIZE}
                  itemHeight={PHOTO_SIZE * 1.35}
                  itemSpacing={PHOTO_GAP}
                  columns={PHOTO_COL}
                  onOrderChange={handleReorderPhotos}
                  renderItem={(photo, idx) => (
                    <View style={[s.photoCell, idx === 0 && s.firstPhotoCell]}>
                      <Image
                        source={{ uri: resolveMediaUrl(photo.photoUrl) }}
                        style={s.photoImg}
                      />
                      <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.4)"]}
                        style={s.photoOverlay}
                      />
                      <Pressable
                        hitSlop={15}
                        style={s.deleteBadge}
                        onPress={() => handleDeletePhoto(photo.id)}
                      >
                        <Ionicons name="close" size={12} color="#FFF" />
                      </Pressable>
                      {idx === 0 && (
                        <LinearGradient
                          colors={[colors.eu.star, "#FFBA08"]}
                          style={s.firstPhotoBadge}
                        >
                          <Ionicons name="star" size={10} color="#0A1628" />
                          <Text style={s.firstPhotoText}>Principal</Text>
                        </LinearGradient>
                      )}
                    </View>
                  )}
                />
              )}
            </View>
          </GestureHandlerRootView>

          <View style={s.gridHintRow}>
            <Ionicons name="hand-left-outline" size={14} color={colors.text.tertiary} />
            <Text style={s.gridHint}>
              Mantén pulsada una foto y arrástrala para reordenarlas
            </Text>
          </View>
        </Animated.View>

        {/* ═══ SECTIONS ═══ */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={s.sectionGroupTitle}>Información</Text>

          <View style={s.sectionContainer}>
            <SectionItem
              icon="document-text-outline"
              iconColor="#8B5CF6"
              iconBg="rgba(139,92,246,0.12)"
              title="Sobre mí"
              badge={user?.bio ? "✓" : ""}
              onPress={() => navigation.navigate("EditAbout")}
            />
            <View style={s.rowDivider} />
            <SectionItem
              icon="information-circle-outline"
              iconColor="#00D68F"
              iconBg="rgba(0,214,143,0.12)"
              title="Básicos"
              badge=""
              onPress={() => navigation.navigate("EditBasics")}
            />
            <View style={s.rowDivider} />
            <SectionItem
              icon="fitness-outline"
              iconColor="#FF8C35"
              iconBg="rgba(255,140,53,0.12)"
              title="Estilo de vida"
              badge=""
              onPress={() => navigation.navigate("EditLifestyle")}
            />
            <View style={s.rowDivider} />
            <SectionItem
              icon="sparkles-outline"
              iconColor="#FF4F6F"
              iconBg="rgba(255,79,111,0.12)"
              title="Mis pasiones"
              badge={
                user?.interests?.length
                  ? `${user.interests.length}`
                  : ""
              }
              onPress={() => navigation.navigate("EditPassions")}
            />
            <View style={s.rowDivider} />
            <SectionItem
              icon="musical-notes-outline"
              iconColor="#1DB954"
              iconBg="rgba(29,185,84,0.12)"
              title="Mi canción del momento"
              badge=""
              onPress={() => navigation.navigate("EditSong")}
            />
          </View>
        </Animated.View>

        {/* ═══ TUS SLIDES ═══ */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <View style={s.slidesHeader}>
            <Ionicons name="color-wand" size={18} color={colors.eu.star} />
            <Text style={s.sectionGroupTitle}>Tus Slides</Text>
            <Text style={s.gridSectionCount}>{slides.length}</Text>
          </View>
          <Text style={s.slidesSubtitle}>
            Arrastra para reordenar cómo se ve tu perfil a los demás
          </Text>

          {slides.length === 0 ? (
            <View style={s.slidesEmpty}>
              <Ionicons name="albums-outline" size={32} color="rgba(255,255,255,0.2)" />
              <Text style={s.slidesEmptyText}>Añade fotos e información para crear slides</Text>
            </View>
          ) : (
            <GestureHandlerRootView style={{ marginBottom: spacing.md }}>
              <SortableHorizontalList
                data={slides}
                keyExtractor={(slide) => slide.id}
                itemWidth={110}
                itemSpacing={spacing.md}
                onOrderChange={(newSlides) => {
                  Haptics.selectionAsync();
                  setSlideOrder(newSlides.map((s) => s.id));
                }}
                renderItem={(slide, idx) => (
                  <Animated.View entering={ZoomIn.delay(300 + idx * 40).springify()}>
                    <View style={s.miniSlide}>
                      <View style={[s.miniSlideIconWrap, { backgroundColor: slide.bg }]}>
                        <Ionicons name={slide.icon} size={26} color={slide.color} />
                      </View>
                      <Text style={s.miniSlideLabel} numberOfLines={2}>{slide.label}</Text>
                      <View style={[s.slideBadge, { backgroundColor: slide.color }]}>
                        <Text style={s.slideBadgeText}>{idx + 1}</Text>
                      </View>
                    </View>
                  </Animated.View>
                )}
              />
            </GestureHandlerRootView>
          )}

          <Pressable
            style={s.addSlideBtn}
            onPress={() => navigation.navigate("EditBasics")} // Shortcut to add more info
          >
            <Ionicons name="add" size={20} color="#06081A" />
            <Text style={s.addSlideText}>Añadir más secciones</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

/* ── Section Item ── */
function SectionItem({
  icon,
  iconColor,
  iconBg,
  title,
  badge,
  onPress,
}: {
  icon: any;
  iconColor: string;
  iconBg: string;
  title: string;
  badge: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        s.sectionItem,
        pressed && { backgroundColor: "rgba(255,255,255,0.04)" },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={[s.sectionIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={s.sectionTitle}>{title}</Text>
      {badge !== "" && (
        <View style={s.sectionBadge}>
          <Text style={s.sectionBadgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.25)" />
    </Pressable>
  );
}

/* ════════════════ STYLES ════════════════ */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.background },

  /* Header */
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
    fontSize: 20,
    color: colors.text.primary,
  },
  scrollContent: { padding: spacing.lg, paddingBottom: 100 },

  /* Grid section header */
  gridSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  gridSectionTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  gridSectionCount: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.text.tertiary,
  },

  /* Photo grid */
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: PHOTO_GAP,
    marginBottom: spacing.sm,
  },
  emptyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: PHOTO_GAP,
    marginTop: PHOTO_GAP,
    marginBottom: spacing.sm,
  },
  photoCell: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE * 1.35,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  firstPhotoCell: {
    borderColor: "rgba(255,215,0,0.35)",
    borderWidth: 2,
  },
  photoImg: {
    width: "100%",
    height: "100%",
    borderRadius: radii.lg - 2,
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii.lg - 2,
  },
  addPhotoInner: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  addPhotoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,215,0,0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(255,215,0,0.2)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 11,
    color: colors.text.tertiary,
  },
  deleteBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(229,62,62,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  firstPhotoBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 4,
  },
  firstPhotoText: {
    fontFamily: typography.families.bodyBold,
    fontSize: 9,
    color: "#0A1628",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  /* Grid hint */
  gridHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  gridHint: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.tertiary,
    flex: 1,
  },

  /* Sections */
  sectionGroupTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  sectionContainer: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    marginBottom: spacing.xl,
  },
  sectionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    flex: 1,
    fontFamily: typography.families.bodyMedium,
    fontSize: 15,
    color: colors.text.primary,
  },
  sectionBadge: {
    backgroundColor: "rgba(255,215,0,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  sectionBadgeText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: colors.eu.star,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginLeft: 62,
  },

  /* Slides section */
  addSlideBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.eu.star,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radii.full,
    alignSelf: "center",
    marginBottom: spacing.xl,
  },
  addSlideText: {
    fontFamily: typography.families.subheading,
    fontSize: 15,
    color: "#06081A",
    marginLeft: 6,
  },
  slidesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 4,
  },
  slidesSubtitle: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
    paddingHorizontal: 2,
  },
  slidesEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    marginBottom: spacing.xl,
  },
  slidesEmptyText: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.3)",
    textAlign: "center",
  },
  miniSlide: {
    width: 110,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
    overflow: "hidden",
  },
  miniSlideIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  miniSlideLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 14,
  },
  slideBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  slideBadgeText: {
    fontFamily: typography.families.bodyBold,
    fontSize: 11,
    color: "#0A1628",
  },
});
