/**
 * ════════════════════════════════════════════════════
 *  V.5 · Time Capsule — Messages to Your Future Self
 *  European Glass DS · Sealed envelopes · Unlock anim
 * ════════════════════════════════════════════════════
 */
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { DS } from "@/design-system/tokens";

interface TimeCapsule {
  id: string;
  message: string;
  createdAt: string;
  revealAt: string;
  isRevealed: boolean;
  mood: string;
}

const MOODS = ["😊", "🥺", "🤩", "💪", "🎉", "❤️", "🌍", "📚"];

const REVEAL_OPTIONS = [
  { label: "1 semana", days: 7 },
  { label: "1 mes", days: 30 },
  { label: "3 meses", days: 90 },
  { label: "6 meses", days: 180 },
  { label: "Fin Erasmus", days: 270 },
];

// Mock sealed capsules
const MOCK_CAPSULES: TimeCapsule[] = [
  {
    id: "1",
    message: "¡Espero que hayas hecho amigos increíbles y visitado al menos 5 países!",
    createdAt: "2024-09-15",
    revealAt: "2025-03-15",
    isRevealed: false,
    mood: "🤩",
  },
  {
    id: "2",
    message: "Recuerda esa noche en el bar de la esquina cuando conociste a tus compañeros de piso. ¡Qué nervios!",
    createdAt: "2024-10-01",
    revealAt: "2024-12-01",
    isRevealed: true,
    mood: "😊",
  },
  {
    id: "3",
    message: "¿Ya dominas el idioma? Seguro que sí, ¡eres genial!",
    createdAt: "2024-11-10",
    revealAt: "2025-06-10",
    isRevealed: false,
    mood: "💪",
  },
];

export default function TimeCapsuleScreen() {
  const navigation = useNavigation();
  const [mode, setMode] = useState<"list" | "create">("list");
  const [capsules, setCapsules] = useState(MOCK_CAPSULES);
  const [message, setMessage] = useState("");
  const [selectedMood, setSelectedMood] = useState("😊");
  const [selectedDays, setSelectedDays] = useState(30);

  const createCapsule = useCallback(() => {
    if (!message.trim()) {
      Alert.alert("Escribe algo", "Tu yo del futuro necesita un mensaje 💌");
      return;
    }

    const now = new Date();
    const reveal = new Date(now);
    reveal.setDate(reveal.getDate() + selectedDays);

    const newCapsule: TimeCapsule = {
      id: String(Date.now()),
      message: message.trim(),
      createdAt: now.toISOString().split("T")[0],
      revealAt: reveal.toISOString().split("T")[0],
      isRevealed: false,
      mood: selectedMood,
    };

    setCapsules((prev) => [newCapsule, ...prev]);
    setMessage("");
    setMode("list");
    Alert.alert("⏳ Cápsula sellada", `Se abrirá el ${reveal.toLocaleDateString("es-ES")}`);
  }, [message, selectedMood, selectedDays]);

  const renderCapsule = ({ item, index }: { item: TimeCapsule; index: number }) => {
    const daysLeft = Math.max(
      0,
      Math.ceil(
        (new Date(item.revealAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    );

    return (
      <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
        <Pressable
          style={[
            styles.capsuleCard,
            item.isRevealed && styles.capsuleRevealed,
          ]}
        >
          {/* Seal icon */}
          <View
            style={[
              styles.sealIcon,
              { backgroundColor: item.isRevealed ? "rgba(56,161,105,0.15)" : "rgba(255,215,0,0.15)" },
            ]}
          >
            <Text style={styles.moodEmoji}>{item.mood}</Text>
          </View>

          <View style={styles.capsuleContent}>
            <View style={styles.capsuleTopRow}>
              <Text style={styles.capsuleDate}>
                Creada: {item.createdAt}
              </Text>
              {item.isRevealed ? (
                <View style={styles.statusBadge}>
                  <Ionicons name="lock-open" size={10} color="#38A169" />
                  <Text style={styles.statusRevealed}>Abierta</Text>
                </View>
              ) : (
                <View style={[styles.statusBadge, styles.statusSealed]}>
                  <Ionicons name="lock-closed" size={10} color="#FFD700" />
                  <Text style={styles.statusSealedText}>{daysLeft}d</Text>
                </View>
              )}
            </View>

            {item.isRevealed ? (
              <Text style={styles.capsuleMessage}>{item.message}</Text>
            ) : (
              <View style={styles.blurredMessage}>
                <Ionicons name="eye-off" size={16} color="rgba(255,255,255,0.2)" />
                <Text style={styles.hiddenText}>
                  Mensaje oculto hasta {item.revealAt}
                </Text>
              </View>
            )}

            <Text style={styles.revealDate}>
              {item.isRevealed ? `Abierta el ${item.revealAt}` : `Se abre: ${item.revealAt}`}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[DS.background, "#0E1A35", "#0A1628"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>⏳ Time Capsule</Text>
          <Text style={styles.headerSubtitle}>
            Mensajes a tu yo del futuro
          </Text>
        </View>
        <Pressable
          onPress={() => setMode(mode === "list" ? "create" : "list")}
          style={styles.addBtn}
        >
          <Ionicons
            name={mode === "list" ? "add" : "list"}
            size={22}
            color={DS.primary}
          />
        </Pressable>
      </View>

      {mode === "create" ? (
        /* ── Create Mode ── */
        <Animated.View entering={FadeInUp.springify()} style={styles.createContainer}>
          {/* Mood selector */}
          <Text style={styles.sectionLabel}>¿Cómo te sientes hoy?</Text>
          <View style={styles.moodsRow}>
            {MOODS.map((mood) => (
              <Pressable
                key={mood}
                onPress={() => setSelectedMood(mood)}
                style={[
                  styles.moodBtn,
                  selectedMood === mood && styles.moodBtnActive,
                ]}
              >
                <Text style={styles.moodText}>{mood}</Text>
              </Pressable>
            ))}
          </View>

          {/* Message */}
          <Text style={styles.sectionLabel}>Tu mensaje</Text>
          <TextInput
            style={styles.textArea}
            value={message}
            onChangeText={setMessage}
            placeholder="Querido/a yo del futuro..."
            placeholderTextColor={DS.textMuted}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{message.length}/500</Text>

          {/* Reveal timing */}
          <Text style={styles.sectionLabel}>¿Cuándo abrirla?</Text>
          <View style={styles.revealOptions}>
            {REVEAL_OPTIONS.map((opt) => (
              <Pressable
                key={opt.days}
                onPress={() => setSelectedDays(opt.days)}
                style={[
                  styles.revealChip,
                  selectedDays === opt.days && styles.revealChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.revealChipText,
                    selectedDays === opt.days && styles.revealChipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Seal button */}
          <Pressable onPress={createCapsule} style={styles.sealButton}>
            <LinearGradient
              colors={["#FFD700", "#FF6B2B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sealButtonGradient}
            >
              <Ionicons name="lock-closed" size={18} color="#fff" />
              <Text style={styles.sealButtonText}>Sellar Cápsula</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      ) : (
        /* ── List Mode ── */
        <FlatList
          data={capsules}
          keyExtractor={(item) => item.id}
          renderItem={renderCapsule}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {capsules.filter((c) => !c.isRevealed).length}
                </Text>
                <Text style={styles.statLabel}>Selladas</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {capsules.filter((c) => c.isRevealed).length}
                </Text>
                <Text style={styles.statLabel}>Abiertas</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{capsules.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 48 }}>⏳</Text>
              <Text style={styles.emptyText}>
                Aún no tienes cápsulas del tiempo
              </Text>
              <Pressable onPress={() => setMode("create")} style={styles.createFirstBtn}>
                <Text style={styles.createFirstText}>Crea la primera</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
  headerSubtitle: { color: DS.textSecondary, fontSize: 12, marginTop: 2 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,215,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  statNumber: { color: DS.primary, fontSize: 22, fontWeight: "800" },
  statLabel: { color: DS.textMuted, fontSize: 10, marginTop: 2 },

  // Capsule card
  listContent: { padding: 16, paddingBottom: 100 },
  capsuleCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  capsuleRevealed: {
    borderColor: "rgba(56,161,105,0.2)",
    backgroundColor: "rgba(56,161,105,0.04)",
  },
  sealIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  moodEmoji: { fontSize: 20 },
  capsuleContent: { flex: 1, gap: 6 },
  capsuleTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  capsuleDate: { color: DS.textMuted, fontSize: 10 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(56,161,105,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusRevealed: { color: "#38A169", fontSize: 10, fontWeight: "600" },
  statusSealed: { backgroundColor: "rgba(255,215,0,0.12)" },
  statusSealedText: { color: "#FFD700", fontSize: 10, fontWeight: "600" },
  capsuleMessage: { color: "#fff", fontSize: 13, lineHeight: 18 },
  blurredMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 8,
    padding: 10,
  },
  hiddenText: { color: DS.textMuted, fontSize: 11, fontStyle: "italic" },
  revealDate: { color: DS.textMuted, fontSize: 10 },

  // Create Mode
  createContainer: { flex: 1, paddingHorizontal: 20 },
  sectionLabel: {
    color: DS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  moodsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  moodBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  moodBtnActive: {
    backgroundColor: "rgba(255,215,0,0.15)",
    borderColor: DS.primary,
  },
  moodText: { fontSize: 20 },

  textArea: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 14,
    color: "#fff",
    fontSize: 14,
    minHeight: 120,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  charCount: {
    color: DS.textMuted,
    fontSize: 10,
    textAlign: "right",
    marginTop: 4,
  },

  revealOptions: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  revealChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  revealChipActive: {
    backgroundColor: "rgba(255,215,0,0.15)",
    borderColor: DS.primary,
  },
  revealChipText: { color: DS.textSecondary, fontSize: 12 },
  revealChipTextActive: { color: DS.primary, fontWeight: "700" },

  sealButton: { marginTop: 24, borderRadius: 14, overflow: "hidden" },
  sealButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  sealButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  emptyContainer: { alignItems: "center", marginTop: 60, gap: 12 },
  emptyText: { color: DS.textMuted, fontSize: 14 },
  createFirstBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(255,215,0,0.15)",
    borderRadius: 20,
  },
  createFirstText: { color: DS.primary, fontWeight: "600" },
});
