import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";

import { ScreenBackground } from "@/design-system";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import { useMyProfile, useUpdateProfile, useUpdateProfilePhoto } from "@/hooks/useProfileQuery";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import type { ProfileStackParamList } from "@/types";

type NavProp = StackNavigationProp<ProfileStackParamList, "EditProfile">;

function formatDate(date?: Date): string {
  if (!date) return "Sin fecha";
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Section({ title, icon, children }: { title: string; icon: keyof typeof Ionicons.glyphMap; children: React.ReactNode }) {
  return (
    <View style={st.section}>
      <View style={st.sectionHeader}>
        <Ionicons name={icon} size={16} color={colors.eu.star} />
        <Text style={st.sectionTitle}>{title}</Text>
      </View>
      <View style={st.sectionBody}>{children}</View>
    </View>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  maxLength?: number;
}) {
  return (
    <View style={st.fieldWrap}>
      <Text style={st.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        style={[st.input, multiline && st.textArea]}
        multiline={multiline}
        maxLength={maxLength}
      />
      {maxLength ? <Text style={st.counter}>{value.length}/{maxLength}</Text> : null}
    </View>
  );
}

export default function EditProfileScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { data: profile, isLoading } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const updatePhoto = useUpdateProfilePhoto();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const saving = updateProfile.isPending || updatePhoto.isPending;

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setBio(profile.bio ?? "");
    setCity(profile.destinationCity ?? "");
    setCountry(profile.destinationCountry ?? "");
    setStartDate(profile.mobilityStartDate ? new Date(profile.mobilityStartDate) : undefined);
    setEndDate(profile.mobilityEndDate ? new Date(profile.mobilityEndDate) : undefined);
    setAvatarUri(profile.profilePhotoUrl ? resolveMediaUrl(profile.profilePhotoUrl) ?? null : null);
  }, [profile]);

  const hasChanges = useMemo(() => {
    if (!profile) return false;
    const profileStart = profile.mobilityStartDate ? new Date(profile.mobilityStartDate).toDateString() : "";
    const profileEnd = profile.mobilityEndDate ? new Date(profile.mobilityEndDate).toDateString() : "";
    const currentStart = startDate ? startDate.toDateString() : "";
    const currentEnd = endDate ? endDate.toDateString() : "";

    return (
      firstName.trim() !== (profile.firstName ?? "") ||
      lastName.trim() !== (profile.lastName ?? "") ||
      bio.trim() !== (profile.bio ?? "") ||
      city.trim() !== (profile.destinationCity ?? "") ||
      country.trim() !== (profile.destinationCountry ?? "") ||
      profileStart !== currentStart ||
      profileEnd !== currentEnd
    );
  }, [profile, firstName, lastName, bio, city, country, startDate, endDate]);

  const pickAvatar = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!profile) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await updateProfile.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim(),
        destinationCity: city.trim(),
        destinationCountry: country.trim(),
        mobilityStartDate: startDate?.toISOString().slice(0, 10),
        mobilityEndDate: endDate?.toISOString().slice(0, 10),
      });

      if (avatarUri && avatarUri.startsWith("file")) {
        await updatePhoto.mutateAsync(avatarUri);
      }

      Alert.alert("Perfil actualizado", "Tus cambios se han guardado correctamente.");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("No se pudo guardar", error?.message ?? "Inténtalo de nuevo en unos segundos.");
    }
  }, [
    profile,
    firstName,
    lastName,
    bio,
    city,
    country,
    startDate,
    endDate,
    avatarUri,
    updateProfile,
    updatePhoto,
    navigation,
  ]);

  if (isLoading && !profile) {
    return (
      <ScreenBackground>
        <View style={st.centered}>
          <ActivityIndicator size="large" color={colors.eu.star} />
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[st.header, { paddingTop: insets.top + 8 }]}> 
          <Pressable onPress={() => navigation.goBack()} style={st.headerBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
          </Pressable>
          <View style={st.headerCenter}>
            <Text style={st.headerEyebrow}>PERFIL</Text>
            <Text style={st.headerTitle}>Editor premium</Text>
          </View>
          <Pressable onPress={handleSave} style={st.headerBtn} disabled={saving || !hasChanges}>
            {saving ? (
              <ActivityIndicator size="small" color={colors.eu.star} />
            ) : (
              <Ionicons
                name="checkmark"
                size={22}
                color={hasChanges ? colors.eu.star : colors.text.tertiary}
              />
            )}
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[st.scroll, { paddingBottom: Math.max(insets.bottom, 16) + 110 }]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.delay(80).springify()} style={st.avatarCard}>
            <LinearGradient
              colors={["rgba(255,215,0,0.12)", "rgba(59,107,255,0.08)", "rgba(255,140,53,0.06)"]}
              style={st.avatarCardGlow}
            />
            <Pressable onPress={pickAvatar} style={st.avatarPress}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={st.avatar} />
              ) : (
                <View style={st.avatarPlaceholder}>
                  <Ionicons name="person" size={34} color={colors.text.primary} />
                </View>
              )}
              <View style={st.cameraBadge}>
                <Ionicons name="camera" size={14} color="#0A1628" />
              </View>
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text style={st.avatarTitle}>Foto principal</Text>
              <Text style={st.avatarSubtitle}>Esta imagen será la portada oficial de tu tarjeta en Inicio, Discover y Perfil.</Text>
              <View style={st.heroHintPill}>
                <Ionicons name="sparkles-outline" size={12} color={colors.eu.star} />
                <Text style={st.heroHintText}>Identidad unificada en toda la app</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(140).springify()}>
            <Section title="Datos personales" icon="person-outline">
              <InputField label="Nombre" value={firstName} onChangeText={setFirstName} placeholder="Tu nombre" />
              <InputField label="Apellidos" value={lastName} onChangeText={setLastName} placeholder="Tus apellidos" />
              <InputField
                label="Bio"
                value={bio}
                onChangeText={setBio}
                placeholder="Cuéntale al mundo quién eres"
                multiline
                maxLength={200}
              />
            </Section>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Section title="Destino Erasmus" icon="location-outline">
              <InputField label="Ciudad" value={city} onChangeText={setCity} placeholder="Ej. Barcelona" />
              <InputField label="País" value={country} onChangeText={setCountry} placeholder="Ej. España" />
            </Section>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(260).springify()}>
            <Section title="Calendario de movilidad" icon="calendar-outline">
              <View style={st.dateRow}>
                <Pressable style={st.dateBtn} onPress={() => setShowStartPicker(true)}>
                  <Ionicons name="calendar-outline" size={16} color={colors.eu.star} />
                  <View>
                    <Text style={st.dateLabel}>Inicio</Text>
                    <Text style={st.dateValue}>{formatDate(startDate)}</Text>
                  </View>
                </Pressable>
                <Pressable style={st.dateBtn} onPress={() => setShowEndPicker(true)}>
                  <Ionicons name="calendar-outline" size={16} color={colors.eu.star} />
                  <View>
                    <Text style={st.dateLabel}>Fin</Text>
                    <Text style={st.dateValue}>{formatDate(endDate)}</Text>
                  </View>
                </Pressable>
              </View>
            </Section>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(320).springify()}>
            <Section title="Subpantallas de perfil" icon="sparkles-outline">
              <View style={st.linkGrid}>
                <Pressable style={st.linkCard} onPress={() => navigation.navigate("EditPhotos")}> 
                  <Ionicons name="images-outline" size={18} color={colors.eu.star} />
                  <Text style={st.linkTitle}>Fotos</Text>
                  <Text style={st.linkDesc}>Organiza tu galería</Text>
                </Pressable>
                <Pressable style={st.linkCard} onPress={() => navigation.navigate("Interests")}> 
                  <Ionicons name="heart-outline" size={18} color={colors.eu.star} />
                  <Text style={st.linkTitle}>Intereses</Text>
                  <Text style={st.linkDesc}>Afinidad con otros</Text>
                </Pressable>
                <Pressable style={st.linkCard} onPress={() => navigation.navigate("Languages")}> 
                  <Ionicons name="language-outline" size={18} color={colors.eu.star} />
                  <Text style={st.linkTitle}>Idiomas</Text>
                  <Text style={st.linkDesc}>Niveles y progreso</Text>
                </Pressable>
                <Pressable style={st.linkCard} onPress={() => navigation.navigate("MoodBoard")}> 
                  <Ionicons name="color-wand-outline" size={18} color={colors.eu.star} />
                  <Text style={st.linkTitle}>Mood Board</Text>
                  <Text style={st.linkDesc}>Tu identidad visual</Text>
                </Pressable>
              </View>
            </Section>
          </Animated.View>
        </ScrollView>

        <View style={[st.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}> 
          <Pressable onPress={handleSave} style={[st.saveBtn, (!hasChanges || saving) && st.saveBtnDisabled]} disabled={!hasChanges || saving}>
            <LinearGradient colors={["#FFD700", "#FF8C35"]} style={st.saveGradient}>
              {saving ? <ActivityIndicator color="#0A1628" /> : <Text style={st.saveText}>Guardar cambios</Text>}
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {showStartPicker && (
        <DateTimePicker
          value={startDate ?? new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_event, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
          themeVariant="dark"
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate ?? new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_event, date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
          themeVariant="dark"
        />
      )}
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
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
    borderColor: "rgba(255,255,255,0.1)",
  },
  headerCenter: {
    alignItems: "center",
  },
  headerEyebrow: {
    fontFamily: typography.families.body,
    fontSize: 10,
    color: colors.text.tertiary,
    letterSpacing: 1,
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
  avatarCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radii.xl,
    padding: spacing.md,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
    position: "relative",
  },
  avatarCardGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  avatarPress: {
    position: "relative",
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: "rgba(255,215,0,0.45)",
  },
  avatarPlaceholder: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.16)",
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.eu.star,
    borderWidth: 2,
    borderColor: "#0A1628",
  },
  avatarTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 15,
    color: colors.text.primary,
  },
  avatarSubtitle: {
    marginTop: 3,
    fontFamily: typography.families.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.text.secondary,
  },
  heroHintPill: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.24)",
    backgroundColor: "rgba(255,215,0,0.09)",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  heroHintText: {
    fontFamily: typography.families.body,
    fontSize: 11,
    color: colors.eu.star,
  },
  section: {
    borderRadius: radii.xl,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  sectionTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 14,
    color: colors.text.primary,
  },
  sectionBody: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  fieldWrap: {
    gap: 4,
  },
  fieldLabel: {
    fontFamily: typography.families.body,
    fontSize: 11,
    color: colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
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
  textArea: {
    minHeight: 86,
    textAlignVertical: "top",
  },
  counter: {
    textAlign: "right",
    fontFamily: typography.families.body,
    fontSize: 10,
    color: colors.text.tertiary,
  },
  dateRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  dateBtn: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateLabel: {
    fontFamily: typography.families.body,
    fontSize: 10,
    textTransform: "uppercase",
    color: colors.text.tertiary,
  },
  dateValue: {
    marginTop: 2,
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.text.primary,
  },
  linkGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  linkCard: {
    width: "48%",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: spacing.sm,
    gap: 4,
  },
  linkTitle: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.text.primary,
  },
  linkDesc: {
    fontFamily: typography.families.body,
    fontSize: 11,
    color: colors.text.tertiary,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: "rgba(4,6,26,0.92)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  saveBtn: {
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  saveBtnDisabled: {
    opacity: 0.55,
  },
  saveGradient: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  saveText: {
    fontFamily: typography.families.subheading,
    fontSize: 15,
    color: "#0A1628",
  },
});
