import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  FlatList,
  Alert,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { GlassButton, Header, LoadingSpinner, EmptyState } from "@/design-system/components";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import { useProfileStore } from "@/store";
import type { UserPhotoResponse } from "@/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PHOTO_SIZE = (SCREEN_WIDTH - spacing.md * 2 - spacing.sm * 2) / 3;
const MAX_PHOTOS = 6;

export default function EditPhotosScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const { photos, isLoadingPhotos, fetchPhotos, addPhoto, deletePhoto } =
    useProfileStore();
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleAdd = useCallback(async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert("Límite alcanzado", `Máximo ${MAX_PHOTOS} fotos`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsAdding(true);
      try {
        await addPhoto(result.assets[0].uri, photos.length);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Error al subir foto";
        Alert.alert("Error", message);
      } finally {
        setIsAdding(false);
      }
    }
  }, [photos.length, addPhoto]);

  const handleDelete = useCallback(
    (photo: UserPhotoResponse) => {
      Alert.alert(
        "Eliminar foto",
        "¿Estás seguro de que quieres eliminar esta foto?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              try {
                await deletePhoto(photo.id);
              } catch (error: unknown) {
                const message =
                  error instanceof Error
                    ? error.message
                    : "Error al eliminar foto";
                Alert.alert("Error", message);
              }
            },
          },
        ],
      );
    },
    [deletePhoto],
  );

  const renderItem = useCallback(
    ({ item }: { item: UserPhotoResponse }) => (
      <View style={styles.photoWrapper}>
        <Image source={{ uri: item.photoUrl }} style={styles.photo} />
        <Pressable
          style={styles.deleteBtn}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.deleteBtnText}>✕</Text>
        </Pressable>
      </View>
    ),
    [handleDelete],
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      <Header title="Mis fotos" onBack={() => navigation.goBack()} />

      {isLoadingPhotos && photos.length === 0 ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size={48} />
        </View>
      ) : (
        <>
          <FlatList
            data={photos}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            numColumns={3}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.gridRow}
            ListEmptyComponent={
              <EmptyState
                icon="📸"
                title="Sin fotos"
                message="Añade fotos para que otros te conozcan"
              />
            }
            ListHeaderComponent={
              <Text style={styles.counter}>
                {photos.length}/{MAX_PHOTOS} fotos
              </Text>
            }
          />

          {photos.length < MAX_PHOTOS && (
            <View style={styles.addContainer}>
              <GlassButton
                title={isAdding ? "Subiendo..." : "➕ Añadir foto"}
                onPress={handleAdd}
                loading={isAdding}
                disabled={isAdding}
              />
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  gridRow: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  counter: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  photoWrapper: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  deleteBtn: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(244,67,54,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  addContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
});
