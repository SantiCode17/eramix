import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import {
  GlassInput,
  GlassButton,
  GlassCard,
  Header,
  LoadingSpinner,
} from "@/design-system/components";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import { useProfileStore } from "@/store";
import type { ProfileStackParamList, UserUpdateRequest } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { handleError } from "@/utils/errorHandler";

type Nav = StackNavigationProp<ProfileStackParamList, "EditProfile">;

export default function EditProfileScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const { profile, updateProfile, updateProfilePhoto, fetchProfile } =
    useProfileStore();

  const [firstName, setFirstName] = useState(profile?.firstName ?? "");
  const [lastName, setLastName] = useState(profile?.lastName ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [destinationCity, setDestinationCity] = useState(
    profile?.destinationCity ?? "",
  );
  const [destinationCountry, setDestinationCountry] = useState(
    profile?.destinationCountry ?? "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? "");
      setLastName(profile.lastName ?? "");
      setBio(profile.bio ?? "");
      setDestinationCity(profile.destinationCity ?? "");
      setDestinationCountry(profile.destinationCountry ?? "");
    }
  }, [profile]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const data: UserUpdateRequest = {};
      if (firstName !== profile?.firstName) data.firstName = firstName;
      if (lastName !== profile?.lastName) data.lastName = lastName;
      if (bio !== profile?.bio) data.bio = bio;
      if (destinationCity !== profile?.destinationCity)
        data.destinationCity = destinationCity;
      if (destinationCountry !== profile?.destinationCountry)
        data.destinationCountry = destinationCountry;

      await updateProfile(data);
      navigation.goBack();
    } catch (error: unknown) {
      const message = handleError(error, "EditProfile.save");
      Alert.alert("Error al guardar perfil", message);
    } finally {
      setIsSaving(false);
    }
  }, [
    firstName,
    lastName,
    bio,
    destinationCity,
    destinationCountry,
    profile,
    updateProfile,
    navigation,
  ]);

  const handlePickPhoto = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploadingPhoto(true);
      try {
        await updateProfilePhoto(result.assets[0].uri);
      } catch (error: unknown) {
        const message = handleError(error, "EditProfile.uploadPhoto");
        Alert.alert("Error al subir foto", message);
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  }, [updateProfilePhoto]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      <Header
        title="Editar perfil"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile photo */}
          <View style={styles.photoSection}>
            <Pressable onPress={handlePickPhoto} disabled={isUploadingPhoto}>
              {profile?.profilePhotoUrl ? (
                <Image
                  source={{ uri: profile.profilePhotoUrl }}
                  style={styles.profilePhoto}
                />
              ) : (
                <View style={styles.photoFallback}>
                  <Text style={styles.photoFallbackText}>
                    {profile?.firstName?.[0]?.toUpperCase() ?? "?"}
                  </Text>
                </View>
              )}
              {isUploadingPhoto ? (
                <View style={styles.photoOverlay}>
                  <LoadingSpinner size={24} />
                </View>
              ) : (
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera-outline" size={18} color={colors.text.primary} />
                </View>
              )}
            </Pressable>
          </View>

          {/* Form fields */}
          <GlassCard variant="surface" style={styles.formCard}>
            <GlassInput
              label="Nombre"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
            <GlassInput
              label="Apellido"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
            <GlassInput
              label="Bio"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
            <GlassInput
              label="Ciudad destino"
              value={destinationCity}
              onChangeText={setDestinationCity}
              autoCapitalize="words"
            />
            <GlassInput
              label="País destino"
              value={destinationCountry}
              onChangeText={setDestinationCountry}
              autoCapitalize="words"
            />
          </GlassCard>

          {/* Quick links */}
          <GlassCard variant="surface" style={styles.linksCard}>
            <Pressable
              style={styles.linkRow}
              onPress={() => navigation.navigate("Interests")}
            >
              <Ionicons name="sparkles-outline" size={20} color={colors.eu.star} />
              <Text style={styles.linkText}>Gestionar intereses</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
            </Pressable>
            <Pressable
              style={styles.linkRow}
              onPress={() => navigation.navigate("Languages")}
            >
              <Ionicons name="globe-outline" size={20} color={colors.eu.star} />
              <Text style={styles.linkText}>Gestionar idiomas</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
            </Pressable>
            <Pressable
              style={styles.linkRow}
              onPress={() => navigation.navigate("EditPhotos")}
            >
              <Ionicons name="images-outline" size={20} color={colors.eu.star} />
              <Text style={styles.linkText}>Gestionar fotos</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
            </Pressable>
          </GlassCard>

          {/* Save button */}
          <GlassButton
            title="Guardar cambios"
            onPress={handleSave}
            loading={isSaving}
            style={styles.saveButton}
          />

          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  // Photo
  photoSection: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  profilePhoto: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: colors.eu.star,
  },
  photoFallback: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.eu.deep,
    borderWidth: 3,
    borderColor: colors.eu.star,
    alignItems: "center",
    justifyContent: "center",
  },
  photoFallbackText: {
    fontFamily: typography.families.heading,
    fontSize: 40,
    color: colors.text.primary,
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.eu.star,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.background.end,
  },
  cameraIcon: { fontSize: 18 },
  // Form
  formCard: { marginBottom: spacing.md },
  // Links
  linksCard: { marginBottom: spacing.lg },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  linkEmoji: { fontSize: 20, marginRight: spacing.md },
  linkText: {
    flex: 1,
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  linkArrow: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
  },
  // Save
  saveButton: { marginTop: spacing.sm },
});
