/**
 * ════════════════════════════════════════════════════════════════
 *  EditPhotosScreen — Photo Grid Manager
 *
 *  • Grid 3×2 con plazas para hasta 6 fotos
 *  • Drag to reorder (placeholder visual)
 *  • Delete overlay con confirmación
 *  • Empty slots como botones de añadir
 *  • React Query mutations (optimistic)
 * ════════════════════════════════════════════════════════════════
 */
import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import type { StackScreenProps } from "@react-navigation/stack";

import {
  ScreenBackground,
  colors,
  typography,
  spacing,
  radii,
  DS,
} from "@/design-system";
import { useMyPhotos, useAddPhoto, useDeletePhoto, useReorderPhotos } from "@/hooks/useProfileQuery";
import type { ProfileStackParamList } from "@/types";
import { SortableGrid } from "@/components/SortableGrid";

type Props = StackScreenProps<ProfileStackParamList, "EditPhotos">;

const { width: SCREEN_W } = Dimensions.get("window");
const GRID_GAP = 10;
const COLS = 3;
const PHOTO_SIZE = (SCREEN_W - spacing.md * 2 - GRID_GAP * (COLS - 1)) / COLS;
const MAX_PHOTOS = 6;

export default function EditPhotosScreen({
  navigation,
}: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { data: photos = [] } = useMyPhotos();
  const addPhoto = useAddPhoto();
  const deletePhoto = useDeletePhoto();
  const reorderPhotos = useReorderPhotos();

  const pickAndAdd = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      addPhoto.mutate({ uri: result.assets[0].uri, displayOrder: photos.length });
    }
  }, [addPhoto, photos.length]);

  const confirmDelete = useCallback(
    (photoId: number) => {
      Alert.alert("Eliminar foto", "¿Seguro que quieres eliminar esta foto?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deletePhoto.mutate(photoId),
        },
      ]);
    },
    [deletePhoto],
  );

  // Render for actual photos
  const renderPhoto = (photo: any, idx: number) => {
    return (
      <View style={styles.photoSlot}>
        <Image
          source={{ uri: photo.photoUrl }}
          style={styles.photoImage}
          resizeMode="cover"
        />
        {/* Delete button */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => confirmDelete(photo.id)}
          activeOpacity={0.7}
        >
          <View style={styles.deleteBtnInner}>
            <Ionicons name="close" size={14} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        {/* Order badge */}
        <View style={styles.orderBadge}>
          <Text style={styles.orderBadgeText}>{idx + 1}</Text>
        </View>
      </View>
    );
  };

  const emptySlots = Array(Math.max(0, MAX_PHOTOS - photos.length)).fill(null);

  return (
    <ScreenBackground>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
            <View style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color={colors.text.primary} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis Fotos</Text>
          <Text style={styles.headerCount}>
            {photos.length}/{MAX_PHOTOS}
          </Text>
        </View>

        <Text style={styles.subtitle}>
          Añade hasta {MAX_PHOTOS} fotos para mostrar en tu perfil
        </Text>

        {/* ── Photo Grid ── */}
        <Animated.View entering={FadeInDown.springify()} style={styles.grid}>
          <SortableGrid
            data={photos}
            keyExtractor={(p) => p.id.toString()}
            renderItem={renderPhoto}
            itemWidth={PHOTO_SIZE}
            itemHeight={PHOTO_SIZE}
            itemSpacing={GRID_GAP}
            columns={COLS}
            onOrderChange={(newPhotos) => {
              const photoOrders = newPhotos.map((p, index) => ({
                photoId: p.id,
                order: index,
              }));
              reorderPhotos.mutate(photoOrders);
            }}
          />

          {/* Render empty slots directly below the sortable grid within the same wrap layout if possible */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: GRID_GAP }}>
            {emptySlots.map((_, idx) => (
              <Animated.View
                key={`empty-${idx}`}
                entering={FadeIn.delay(50 * (photos.length + idx)).duration(300)}
              >
                <TouchableOpacity
                  style={styles.emptySlot}
                  onPress={pickAndAdd}
                  activeOpacity={0.7}
                  disabled={addPhoto.isPending}
                >
                  {addPhoto.isPending && idx === 0 ? (
                    <ActivityIndicator color={DS.primary} />
                  ) : (
                    <>
                      <Ionicons name="add" size={28} color={DS.primary} />
                      <Text style={styles.emptySlotText}>Añadir</Text>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* ── Hint ── */}
        <View style={styles.hintRow}>
          <Ionicons name="information-circle-outline" size={16} color={colors.text.tertiary} />
          <Text style={styles.hintText}>
            La primera foto será tu foto principal de perfil
          </Text>
        </View>
      </View>
    </ScreenBackground>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Styles
// ═══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h4.fontSize,
    color: colors.text.primary,
  },
  headerCount: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: DS.primary,
    backgroundColor: "rgba(255,215,0,0.10)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },

  subtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
    paddingHorizontal: spacing.md,
    marginBottom: 16,
  },

  // ── Grid ──
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.md,
    gap: GRID_GAP,
  },

  // ── Photo Slot ──
  photoSlot: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: radii.md,
    overflow: "hidden",
    position: "relative",
  },
  photoImage: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
  },
  deleteBtn: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  deleteBtnInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(229,62,62,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  orderBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(10,22,40,0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
  },
  orderBadgeText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 10,
    color: DS.primary,
  },

  // ── Empty Slot ──
  emptySlot: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: "rgba(255,215,0,0.20)",
    borderStyle: "dashed",
    backgroundColor: "rgba(255,215,0,0.04)",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  emptySlotText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.tiny.fontSize,
    color: DS.primary,
  },

  // ── Hint ──
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    marginTop: 20,
  },
  hintText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
    flex: 1,
  },
});
