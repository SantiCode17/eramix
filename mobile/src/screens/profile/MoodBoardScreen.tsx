/**
 * ════════════════════════════════════════════════════
 *  V.6 · Mood Board — Photo Collage Creator
 *  European Glass DS · Grid layout · Add from gallery
 * ════════════════════════════════════════════════════
 */
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  Layout,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { DS } from "@/design-system/tokens";

interface MoodBoardItem {
  id: string;
  type: "photo" | "text" | "sticker";
  uri?: string;
  text?: string;
  emoji?: string;
  color?: string;
}

const STICKERS = ["🌍", "✈️", "🎒", "📸", "🍕", "🎶", "❤️", "🏛️", "🌅", "🥂", "🎭", "⭐"];

const MOODS = [
  { label: "Aventurero", color: "#FFD700", emoji: "🧭" },
  { label: "Nostálgico", color: "#9F7AEA", emoji: "💭" },
  { label: "Feliz", color: "#68D391", emoji: "😄" },
  { label: "Inspirado", color: "#63B3ED", emoji: "✨" },
  { label: "Enamorado", color: "#FC8181", emoji: "💕" },
];

export default function MoodBoardScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState<MoodBoardItem[]>([]);
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [textInput, setTextInput] = useState("");

  const addPhoto = useCallback(() => {
    // In production: use expo-image-picker
    const mockPhotos = [
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=300",
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=300",
      "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=300",
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=300",
    ];
    const newItem: MoodBoardItem = {
      id: String(Date.now()),
      type: "photo",
      uri: mockPhotos[items.filter((i) => i.type === "photo").length % mockPhotos.length],
    };
    setItems((prev) => [...prev, newItem]);
  }, [items]);

  const addSticker = useCallback(
    (emoji: string) => {
      setItems((prev) => [
        ...prev,
        { id: String(Date.now()), type: "sticker", emoji },
      ]);
      setShowStickerPicker(false);
    },
    []
  );

  const addTextNote = useCallback(() => {
    if (!textInput.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        type: "text",
        text: textInput.trim(),
        color: selectedMood.color,
      },
    ]);
    setTextInput("");
  }, [textInput, selectedMood]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

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
          <Text style={styles.headerTitle}>🎨 Mood Board</Text>
          <Text style={styles.headerSubtitle}>Tu collage Erasmus</Text>
        </View>
        <Pressable
          onPress={() =>
            Alert.alert("Compartir", "Mood board guardado y compartido ✨")
          }
          style={styles.shareBtn}
        >
          <Ionicons name="share-outline" size={20} color={DS.primary} />
        </Pressable>
      </View>

      {/* Mood selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.moodRow}
        contentContainerStyle={styles.moodContent}
      >
        {MOODS.map((mood) => (
          <Pressable
            key={mood.label}
            onPress={() => setSelectedMood(mood)}
            style={[
              styles.moodChip,
              selectedMood.label === mood.label && {
                backgroundColor: mood.color + "20",
                borderColor: mood.color,
              },
            ]}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text
              style={[
                styles.moodLabel,
                selectedMood.label === mood.label && { color: mood.color },
              ]}
            >
              {mood.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Board Canvas */}
      <ScrollView
        style={styles.canvas}
        contentContainerStyle={styles.canvasContent}
      >
        <View style={styles.grid}>
          {items.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={ZoomIn.delay(index * 50).springify()}
              layout={Layout.springify()}
              style={[
                styles.gridItem,
                item.type === "text" && { backgroundColor: item.color + "15" },
                item.type === "sticker" && styles.stickerItem,
              ]}
            >
              {item.type === "photo" && (
                <Image source={{ uri: item.uri }} style={styles.gridPhoto} />
              )}
              {item.type === "sticker" && (
                <Text style={styles.stickerText}>{item.emoji}</Text>
              )}
              {item.type === "text" && (
                <Text style={[styles.noteText, { color: item.color }]}>
                  {item.text}
                </Text>
              )}

              {/* Delete btn */}
              <Pressable
                onPress={() => removeItem(item.id)}
                style={styles.deleteBtn}
              >
                <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.7)" />
              </Pressable>
            </Animated.View>
          ))}

          {/* Add placeholder */}
          {items.length < 12 && (
            <Animated.View entering={FadeInDown} style={styles.addPlaceholder}>
              <Ionicons name="add" size={32} color="rgba(255,255,255,0.15)" />
              <Text style={styles.addPlaceholderText}>
                {items.length === 0 ? "Añade tu primer recuerdo" : "Añadir más"}
              </Text>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Sticker Picker */}
      {showStickerPicker && (
        <Animated.View entering={FadeInUp.springify()} style={styles.stickerPicker}>
          <Text style={styles.pickerTitle}>Stickers</Text>
          <View style={styles.stickersGrid}>
            {STICKERS.map((s) => (
              <Pressable key={s} onPress={() => addSticker(s)} style={styles.stickerBtn}>
                <Text style={styles.stickerBtnText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Bottom Toolbar */}
      <View style={styles.toolbar}>
        <Pressable onPress={addPhoto} style={styles.toolBtn}>
          <Ionicons name="image" size={22} color="#63B3ED" />
          <Text style={styles.toolLabel}>Foto</Text>
        </Pressable>
        <Pressable
          onPress={() => setShowStickerPicker(!showStickerPicker)}
          style={styles.toolBtn}
        >
          <Ionicons name="happy" size={22} color="#F6E05E" />
          <Text style={styles.toolLabel}>Sticker</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            Alert.prompt
              ? Alert.prompt("Nota", "Escribe algo:", (text) => {
                  if (text) {
                    setTextInput(text);
                    addTextNote();
                  }
                })
              : addTextNote();
          }}
          style={styles.toolBtn}
        >
          <Ionicons name="text" size={22} color="#FC8181" />
          <Text style={styles.toolLabel}>Texto</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            Alert.alert("💾 Guardado", "Tu mood board se ha guardado")
          }
          style={styles.toolBtn}
        >
          <Ionicons name="save" size={22} color="#68D391" />
          <Text style={styles.toolLabel}>Guardar</Text>
        </Pressable>
      </View>
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
    paddingBottom: 8,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
  headerSubtitle: { color: DS.textSecondary, fontSize: 12, marginTop: 2 },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,215,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Mood row
  moodRow: { maxHeight: 44, marginVertical: 8 },
  moodContent: { paddingHorizontal: 16, gap: 8 },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  moodEmoji: { fontSize: 16 },
  moodLabel: { color: DS.textSecondary, fontSize: 12, fontWeight: "600" },

  // Canvas
  canvas: { flex: 1 },
  canvasContent: { padding: 12 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gridItem: {
    width: "47.5%",
    aspectRatio: 1,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  gridPhoto: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
  },
  stickerItem: {
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  stickerText: { fontSize: 48 },
  noteText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    padding: 12,
  },
  deleteBtn: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  addPlaceholder: {
    width: "47.5%",
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addPlaceholderText: { color: DS.textMuted, fontSize: 11 },

  // Sticker picker
  stickerPicker: {
    position: "absolute",
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: DS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  pickerTitle: { color: "#fff", fontWeight: "700", marginBottom: 12 },
  stickersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  stickerBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  stickerBtnText: { fontSize: 24 },

  // Toolbar
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(4,6,26,0.9)",
  },
  toolBtn: { alignItems: "center", gap: 4 },
  toolLabel: { color: DS.textSecondary, fontSize: 10, fontWeight: "600" },
});
