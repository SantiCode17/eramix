import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import type { StackScreenProps } from "@react-navigation/stack";

import { ScreenBackground } from "@/design-system";
import { colors, radii, spacing, typography } from "@/design-system/tokens";
import type { ProfileStackParamList } from "@/types";
import { useMyProfile, useUpdateProfile, useUpdateProfilePhoto } from "@/hooks/useProfileQuery";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";

type Props = StackScreenProps<ProfileStackParamList, "EditProfile">;

/* ── Reusable Field ── */
function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  maxLength,
  icon,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
  maxLength?: number;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={s.field}>
      <View style={s.fieldLabelRow}>
        {icon && <Ionicons name={icon} size={12} color={colors.text.tertiary} />}
        <Text style={s.fieldLabel}>{label}</Text>
        {maxLength != null && (
          <Text style={s.fieldCounter}>{value.length}/{maxLength}</Text>
        )}
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        style={[s.input, multiline && s.inputMultiline]}
        multiline={multiline}
        maxLength={maxLength}
      />
    </View>
  );
}

/* ── Section ── */
function Section({
  title,
  icon,
  children,
  delay = 0,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={s.section}>
      <View style={s.sectionHeader}>
        <Ionicons name={icon} size={15} color={colors.eu.star} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      <View style={s.sectionBody}>{children}</View>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════════════════ */
export default function EditProfileScreenV2({ navigation }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const profileQuery = useMyProfile();
  const updateProfile = useUpdateProfile();
  const updatePhoto = useUpdateProfilePhoto();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setBio(profile.bio ?? "");
    setCity(profile.destinationCity ?? "");
    setCountry(profile.destinationCountry ?? "");
    setStartDate(profile.mobilityStartDate ? new Date(profile.mobilityStartDate) : undefined);
    setEndDate(profile.mobilityEndDate ? new Date(profile.mobilityEndDate) : undefined);
    setAvatarUri(profile.profilePhotoUrl ? resolveMediaUrl(profile.profilePhotoUrl) ?? null : null);
  }, [profileQuery.data]);

  const hasChanges = useMemo(() => {
    const profile = profileQuery.data;
    if (!profile) return false;
    return (
      firstName.trim() !== (profile.firstName ?? "") ||
      lastName.trim() !== (profile.lastName ?? "") ||
      bio.trim() !== (profile.bio ?? "") ||
      city.trim() !== (profile.destinationCity ?? "") ||
      country.trim() !== (profile.destinationCountry ?? "") ||
      (startDate?.toISOString().slice(0, 10) ?? "") !== (profile.mobilityStartDate ?? "") ||
      (endDate?.toISOString().slice(0, 10) ?? "") !== (profile.mobilityEndDate ?? "")
    );
  }, [profileQuery.data, firstName, lastName, bio, city, country, startDate, endDate]);

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

  const onSave = useCallback(async () => {
    const profile = profileQuery.data;
    if (!profile) return;
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Datos obligatorios", "Nombre y apellidos son obligatorios.");
      return;
    }
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
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? "No se pudo guardar el perfil.");
    }
  }, [profileQuery.data, firstName, lastName, bio, city, country, startDate, endDate, avatarUri, updateProfile, updatePhoto, navigation]);

  const saving = updateProfile.isPending || updatePhoto.isPending;

  if (profileQuery.isLoading && !profileQuery.data) {
    return (
      <ScreenBackground>
        <View style={s.centered}>
          <ActivityIndicator color={colors.eu.star} size="large" />
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* ── Header ── */}
        <View style={[s.header, { paddingTop: insets.top + 8 }]}>
          <Pressable style={s.headerBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
          </Pressable>
          <View style={s.headerCenter}>
            <Text style={s.headerEyebrow}>EDITAR</Text>
            <Text style={s.headerTitle}>Perfil</Text>
          </View>
          <Pressable style={s.headerBtn} onPress={onSave} disabled={!hasChanges || saving}>
            {saving ? (
              <ActivityIndicator color={colors.eu.star} size="small" />
            ) : (
              <Ionicons name="checkmark" size={20} color={hasChanges ? colors.eu.star : colors.text.tertiary} />
            )}
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: Math.max(insets.bottom, 16) + 100 }]} showsVerticalScrollIndicator={false}>
          {/* ── Avatar ── */}
          <Animated.View entering={FadeInDown.delay(60).springify()} style={s.avatarCard}>
            <LinearGradient
              colors={["rgba(255,215,0,0.1)", "rgba(59,107,255,0.06)", "transparent"]}
              style={StyleSheet.absoluteFillObject}
            />
            <Pressable style={s.avatarPress} onPress={pickAvatar}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={s.avatar} />
              ) : (
                <View style={s.avatarFallback}>
                  <Ionicons name="person" size={32} color={colors.text.primary} />
                </View>
              )}
              <View style={s.badge}>
                <Ionicons name="camera" size={13} color="#0A1628" />
              </View>
            </Pressable>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={s.avatarTitle}>Foto de perfil</Text>
              <Text style={s.avatarSubtitle}>Visible en tu perfil, tarjeta y en toda la app.</Text>
              <View style={s.avatarHint}>
                <Ionicons name="sparkles-outline" size={11} color={colors.eu.star} />
                <Text style={s.avatarHintText}>Identidad unificada</Text>
              </View>
            </View>
          </Animated.View>

          {/* ── Identidad ── */}
          <Section title="Datos personales" icon="person-outline" delay={120}>
            <Field label="Nombre" value={firstName} onChangeText={setFirstName} placeholder="Tu nombre" icon="text-outline" />
            <Field label="Apellidos" value={lastName} onChangeText={setLastName} placeholder="Tus apellidos" icon="text-outline" />
            <Field label="Bio" value={bio} onChangeText={setBio} placeholder="Cuéntale al mundo quién eres" multiline maxLength={200} icon="chatbubble-outline" />
          </Section>

          {/* ── Destino ── */}
          <Section title="Destino Erasmus" icon="location-outline" delay={180}>
            <Field label="Ciudad" value={city} onChangeText={setCity} placeholder="Ej. Barcelona" icon="business-outline" />
            <Field label="País" value={country} onChangeText={setCountry} placeholder="Ej. España" icon="flag-outline" />
          </Section>

          {/* ── Fechas ── */}
          <Section title="Calendario de movilidad" icon="calendar-outline" delay={240}>
            <View style={s.dateRow}>
              <Pressable style={s.dateCard} onPress={() => setShowStart(true)}>
                <Ionicons name="calendar-outline" size={15} color={colors.eu.star} />
                <View>
                  <Text style={s.dateLabel}>Inicio</Text>
                  <Text style={s.dateValue}>{startDate ? startDate.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "Sin definir"}</Text>
                </View>
              </Pressable>
              <Pressable style={s.dateCard} onPress={() => setShowEnd(true)}>
                <Ionicons name="calendar-outline" size={15} color={colors.eu.star} />
                <View>
                  <Text style={s.dateLabel}>Fin</Text>
                  <Text style={s.dateValue}>{endDate ? endDate.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "Sin definir"}</Text>
                </View>
              </Pressable>
            </View>
          </Section>

          {/* ── Quick links ── */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={s.linksSection}>
            <Text style={s.linksSectionTitle}>Más opciones</Text>
            <View style={s.linksGrid}>
              <Pressable style={s.linkCard} onPress={() => navigation.navigate("EditPhotos")}>
                <Ionicons name="images-outline" size={18} color={colors.eu.star} />
                <Text style={s.linkTitle}>Fotos</Text>
                <Text style={s.linkDesc}>Organiza tu galería</Text>
              </Pressable>
              <Pressable style={s.linkCard} onPress={() => navigation.navigate("Interests")}>
                <Ionicons name="heart-outline" size={18} color={colors.eu.star} />
                <Text style={s.linkTitle}>Intereses</Text>
                <Text style={s.linkDesc}>Afinidad con otros</Text>
              </Pressable>
              <Pressable style={s.linkCard} onPress={() => navigation.navigate("Languages")}>
                <Ionicons name="language-outline" size={18} color={colors.eu.star} />
                <Text style={s.linkTitle}>Idiomas</Text>
                <Text style={s.linkDesc}>Niveles y progreso</Text>
              </Pressable>
              <Pressable style={s.linkCard} onPress={() => navigation.navigate("CardCustomize")}>
                <Ionicons name="color-palette-outline" size={18} color={colors.eu.star} />
                <Text style={s.linkTitle}>Mi tarjeta</Text>
                <Text style={s.linkDesc}>Personaliza colores</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>

        {/* ── Floating save bar ── */}
        <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <Pressable onPress={onSave} style={[s.saveBtn, (!hasChanges || saving) && s.saveBtnDisabled]} disabled={!hasChanges || saving}>
            <LinearGradient colors={["#FFD700", "#FF8C35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.saveGradient}>
              {saving ? <ActivityIndicator color="#0A1628" /> : <Text style={s.saveText}>Guardar cambios</Text>}
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {showStart && (
        <DateTimePicker
          value={startDate ?? new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(e: any, date?: Date) => { 
            setShowStart(false); 
            if (e.type === "set" || Platform.OS === "ios") {
              const selectedDate = e.nativeEvent?.timestamp ? new Date(e.nativeEvent.timestamp) : date;
              if (selectedDate && !isNaN(selectedDate.getTime())) {
                setStartDate(selectedDate); 
              }
            }
          }}
          themeVariant="dark"
        />
      )}
      {showEnd && (
        <DateTimePicker
          value={endDate ?? new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(e: any, date?: Date) => { 
            setShowEnd(false); 
            if (e.type === "set" || Platform.OS === "ios") {
              const selectedDate = e.nativeEvent?.timestamp ? new Date(e.nativeEvent.timestamp) : date;
              if (selectedDate && !isNaN(selectedDate.getTime())) {
                setEndDate(selectedDate); 
              }
            }
          }}
          themeVariant="dark"
        />
      )}
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
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
    borderColor: "rgba(255,255,255,0.12)",
  },
  headerCenter: { alignItems: "center" },
  headerEyebrow: {
    fontFamily: typography.families.body,
    fontSize: 10,
    color: colors.text.tertiary,
    letterSpacing: 1.2,
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
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.xl,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    overflow: "hidden",
  },
  avatarPress: { position: "relative" },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: "rgba(255,215,0,0.4)",
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.16)",
  },
  badge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.eu.star,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0A1628",
  },
  avatarTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 15,
    color: colors.text.primary,
  },
  avatarSubtitle: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 17,
  },
  avatarHint: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.2)",
    backgroundColor: "rgba(255,215,0,0.06)",
  },
  avatarHintText: {
    fontFamily: typography.families.body,
    fontSize: 10,
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
  field: { gap: 4 },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  fieldLabel: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: 11,
    color: colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  fieldCounter: {
    fontFamily: typography.families.body,
    fontSize: 10,
    color: colors.text.tertiary,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: typography.families.body,
    fontSize: 14,
    color: colors.text.primary,
  },
  inputMultiline: {
    minHeight: 86,
    textAlignVertical: "top",
  },
  dateRow: { flexDirection: "row", gap: spacing.sm },
  dateCard: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateLabel: {
    fontFamily: typography.families.body,
    fontSize: 10,
    color: colors.text.tertiary,
    textTransform: "uppercase",
  },
  dateValue: {
    marginTop: 2,
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.text.primary,
  },
  linksSection: {
    gap: spacing.sm,
  },
  linksSectionTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 14,
    color: colors.text.primary,
    paddingHorizontal: 2,
  },
  linksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  linkCard: {
    width: "48%",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: spacing.sm,
    gap: 4,
  },
  linkTitle: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.text.primary,
    marginTop: 4,
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
  saveBtnDisabled: { opacity: 0.5 },
  saveGradient: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: radii.lg,
  },
  saveText: {
    fontFamily: typography.families.subheading,
    fontSize: 15,
    color: "#0A1628",
  },
});
