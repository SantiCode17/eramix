import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import * as eventsApi from "@/api/events";
import { colors, typography, spacing, radii } from "@/design-system/tokens";

const CATEGORIES = [
  "fiesta",
  "academico",
  "deporte",
  "comida",
  "musica",
  "viaje",
  "cultura",
  "networking",
];

const CATEGORY_EMOJI: Record<string, string> = {
  fiesta: "🎉",
  academico: "🎓",
  deporte: "⚽",
  comida: "🍕",
  musica: "🎵",
  viaje: "✈️",
  cultura: "🎨",
  networking: "🤝",
};

export default function CreateEventScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState(new Date(Date.now() + 86400000)); // tomorrow
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [maxParticipants, setMaxParticipants] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert("Error", "El título es obligatorio");
      return;
    }

    setSubmitting(true);
    try {
      await eventsApi.createEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        category: category || undefined,
        location: location.trim() || undefined,
        startDatetime: startDate.toISOString(),
        endDatetime: endDate?.toISOString(),
        maxParticipants: maxParticipants ? parseInt(maxParticipants, 10) : undefined,
        isPublic,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo crear el evento");
    } finally {
      setSubmitting(false);
    }
  }, [title, description, category, location, startDate, endDate, maxParticipants, isPublic]);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Nuevo Evento</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.form,
            { paddingBottom: insets.bottom + 100 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.field}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="¿Cómo se llama tu evento?"
              placeholderTextColor={colors.text.disabled}
              value={title}
              onChangeText={setTitle}
              maxLength={200}
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Cuéntanos más sobre el evento..."
              placeholderTextColor={colors.text.disabled}
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={2000}
            />
          </View>

          {/* Category chips */}
          <View style={styles.field}>
            <Text style={styles.label}>Categoría</Text>
            <View style={styles.chipsWrap}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setCategory(category === cat ? "" : cat);
                  }}
                  style={[
                    styles.catChip,
                    category === cat && styles.catChipActive,
                  ]}
                >
                  <Text style={styles.catChipText}>
                    {CATEGORY_EMOJI[cat] ?? ""} {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Location */}
          <View style={styles.field}>
            <Text style={styles.label}>📍 Ubicación</Text>
            <TextInput
              style={styles.input}
              placeholder="¿Dónde será?"
              placeholderTextColor={colors.text.disabled}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Start date */}
          <View style={styles.field}>
            <Text style={styles.label}>📅 Inicio *</Text>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(startDate)}</Text>
            </Pressable>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="datetime"
                minimumDate={new Date()}
                onChange={(_: any, date?: Date) => {
                  setShowStartPicker(Platform.OS === "ios");
                  if (date) setStartDate(date);
                }}
                themeVariant="dark"
              />
            )}
          </View>

          {/* End date */}
          <View style={styles.field}>
            <Text style={styles.label}>⏰ Fin (opcional)</Text>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.dateText}>
                {endDate ? formatDate(endDate) : "Sin hora de fin"}
              </Text>
            </Pressable>
            {showEndPicker && (
              <DateTimePicker
                value={endDate ?? startDate}
                mode="datetime"
                minimumDate={startDate}
                onChange={(_: any, date?: Date) => {
                  setShowEndPicker(Platform.OS === "ios");
                  if (date) setEndDate(date);
                }}
                themeVariant="dark"
              />
            )}
          </View>

          {/* Max participants */}
          <View style={styles.field}>
            <Text style={styles.label}>👥 Máximo participantes (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Sin límite"
              placeholderTextColor={colors.text.disabled}
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              keyboardType="number-pad"
            />
          </View>

          {/* Public toggle */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>🌍 Evento público</Text>
              <Text style={styles.toggleHint}>
                {isPublic
                  ? "Visible para todos los usuarios"
                  : "Solo visible para tus amigos"}
              </Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{
                false: colors.glass.whiteMid,
                true: colors.eu.star,
              }}
              thumbColor="#FFF"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit button */}
      <View style={[styles.submitBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <LinearGradient
            colors={[colors.eu.orange, "#FF8B4F"]}
            style={styles.submitGrad}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitText}>Crear evento</Text>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────

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
    color: colors.eu.star,
  },

  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.lg },

  field: { gap: spacing.xs },
  label: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 14,
    color: colors.text.primary,
  },
  input: {
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
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: spacing.sm + 2,
  },

  // Category chips
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  catChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.glass.white,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  catChipActive: {
    backgroundColor: "rgba(255,204,0,0.2)",
    borderColor: colors.eu.star,
  },
  catChipText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.text.secondary,
    textTransform: "capitalize",
  },

  // Date
  dateButton: {
    backgroundColor: colors.glass.white,
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  dateText: {
    fontFamily: typography.families.body,
    fontSize: 15,
    color: colors.text.primary,
  },

  // Toggle
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  toggleHint: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },

  // Submit
  submitBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: "rgba(26,26,46,0.95)",
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
  },
  submitButton: { borderRadius: radii.xl, overflow: "hidden" },
  submitGrad: {
    paddingVertical: spacing.md,
    alignItems: "center",
    borderRadius: radii.xl,
  },
  submitText: {
    fontFamily: typography.families.subheading,
    fontSize: 16,
    color: "#FFF",
  },
});
