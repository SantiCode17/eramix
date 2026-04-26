/**
 * ════════════════════════════════════════════════════════════════
 *  EditSongScreen — Galactic Premium Music Selector
 *  Spotify-inspired player UI · Album art placeholders ·
 *  Animated search · Glass song cards · EU Gold accents
 * ════════════════════════════════════════════════════════════════
 */
import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeIn, FadeInUp } from "react-native-reanimated";
import { BlurView } from "expo-blur";

import { colors, typography, spacing, radii, DS } from "@/design-system/tokens";
import { useAuthStore } from "@/store/useAuthStore";
import { profileApi } from "@/api/profileService";

/* ── Mock songs ── */
const MOCK_SONGS = [
  { id: "1", title: "Blinding Lights", artist: "The Weeknd", color: "#E11D48" },
  { id: "2", title: "Bohemian Rhapsody", artist: "Queen", color: "#8B5CF6" },
  { id: "3", title: "Despacito", artist: "Luis Fonsi", color: "#FFD700" },
  { id: "4", title: "Shape of You", artist: "Ed Sheeran", color: "#1DB954" },
  { id: "5", title: "Levitating", artist: "Dua Lipa", color: "#3B82F6" },
  { id: "6", title: "Uptown Funk", artist: "Bruno Mars", color: "#FF8C35" },
  { id: "7", title: "Someone Like You", artist: "Adele", color: "#FF4F6F" },
  { id: "8", title: "Bad Guy", artist: "Billie Eilish", color: "#00D68F" },
  { id: "9", title: "Watermelon Sugar", artist: "Harry Styles", color: "#E11D48" },
  { id: "10", title: "Flowers", artist: "Miley Cyrus", color: "#FFD700" },
];

export default function EditSongScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_SONGS;
    const q = search.toLowerCase();
    return MOCK_SONGS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q)
    );
  }, [search]);

  const selectSong = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected((prev) => (prev === id ? null : id));
  }, []);

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!selected) {
      navigation.goBack();
      return;
    }
    const song = MOCK_SONGS.find((s) => s.id === selected);
    if (!song) return;

    setSaving(true);
    try {
      const updated = await profileApi.updateProfile({
        favoriteSong: `${song.title} - ${song.artist}`,
      });
      updateUser(updated);
      navigation.goBack();
    } catch {
      Alert.alert("Error", "No se pudo guardar la canción");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <Animated.View entering={FadeIn.duration(300)} style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.headerBtn} hitSlop={12}>
          <View style={s.headerBtnCircle}>
            <Ionicons name="arrow-back" size={20} color={colors.text.primary} />
          </View>
        </Pressable>
        <Text style={s.headerTitle}>Mi canción</Text>
        <View style={s.headerBtn} />
      </Animated.View>

      {/* ── Spotify-style hero ── */}
      <Animated.View entering={FadeInDown.delay(80).springify()} style={s.heroCard}>
        <BlurView intensity={20} tint="dark" style={s.heroBlur}>
          <LinearGradient
            colors={["rgba(29,185,84,0.15)", "rgba(29,185,84,0.02)"]}
            style={s.heroGrad}
          >
            <View style={s.heroIconCircle}>
              <Ionicons name="musical-notes" size={28} color="#1DB954" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.heroTitle}>Tu himno del momento</Text>
              <Text style={s.heroSub}>
                {user?.favoriteSong
                  ? `Actual: ${user.favoriteSong}`
                  : "Elige la canción que te define ahora mismo"}
              </Text>
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>

      {/* ── Search bar ── */}
      <Animated.View entering={FadeInDown.delay(120).springify()} style={s.searchWrap}>
        <View style={s.searchBar}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.35)" />
          <TextInput
            style={s.searchInput}
            placeholder="Buscar canción o artista..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.3)" />
            </Pressable>
          )}
        </View>
      </Animated.View>

      {/* ── Song list ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {filtered.map((song, idx) => {
          const isSelected = selected === song.id;
          return (
            <Animated.View
              key={song.id}
              entering={FadeInDown.delay(160 + idx * 40).springify()}
            >
              <Pressable
                style={({ pressed }) => [
                  s.songRow,
                  isSelected && s.songRowSelected,
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => selectSong(song.id)}
              >
                {/* Album art placeholder */}
                <LinearGradient
                  colors={[song.color, `${song.color}88`]}
                  style={s.albumArt}
                >
                  <Ionicons
                    name="musical-note"
                    size={20}
                    color="rgba(255,255,255,0.8)"
                  />
                </LinearGradient>

                {/* Song info */}
                <View style={s.songInfo}>
                  <Text
                    style={[
                      s.songTitle,
                      isSelected && { color: colors.eu.star },
                    ]}
                    numberOfLines={1}
                  >
                    {song.title}
                  </Text>
                  <Text style={s.songArtist} numberOfLines={1}>
                    {song.artist}
                  </Text>
                </View>

                {/* Selection indicator */}
                {isSelected ? (
                  <View style={s.selectedDot}>
                    <LinearGradient
                      colors={["#FFD700", "#FFBA08"]}
                      style={s.selectedDotGrad}
                    >
                      <Ionicons name="checkmark" size={14} color="#0A1628" />
                    </LinearGradient>
                  </View>
                ) : (
                  <View style={s.unselectedDot} />
                )}
              </Pressable>
            </Animated.View>
          );
        })}

        {filtered.length === 0 && (
          <View style={s.emptyState}>
            <Ionicons name="musical-notes-outline" size={48} color="rgba(255,255,255,0.15)" />
            <Text style={s.emptyText}>No se encontraron canciones</Text>
          </View>
        )}
      </ScrollView>

      {/* ── Save button ── */}
      <Animated.View
        entering={FadeInUp.delay(400).springify()}
        style={[s.saveWrap, { paddingBottom: insets.bottom + spacing.md }]}
      >
        <Pressable
          style={({ pressed }) => [
            s.saveBtn,
            pressed && { transform: [{ scale: 0.97 }] },
            saving && { opacity: 0.6 },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          <LinearGradient
            colors={["#FFD700", "#FFBA08"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.saveBtnGrad}
          >
            <Ionicons name="checkmark" size={20} color="#0A1628" />
            <Text style={s.saveBtnText}>
              {saving ? "Guardando..." : "Guardar"}
            </Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.background },
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
    fontSize: 18,
    color: colors.text.primary,
  },

  /* Hero */
  heroCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(29,185,84,0.15)",
  },
  heroBlur: {
    width: "100%",
  },
  heroGrad: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
  },
  heroIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(29,185,84,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 2,
  },
  heroSub: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.tertiary,
    lineHeight: 18,
  },

  /* Search */
  searchWrap: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    height: 46,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: 15,
    color: "#FFF",
  },

  /* Songs list */
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    paddingRight: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.xs,
    gap: spacing.md,
  },
  songRowSelected: {
    backgroundColor: "rgba(255,215,0,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.15)",
  },
  albumArt: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  songInfo: { flex: 1 },
  songTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 2,
  },
  songArtist: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.secondary,
  },
  selectedDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    overflow: "hidden",
  },
  selectedDotGrad: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  unselectedDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
  },

  /* Empty state */
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  emptyText: {
    fontFamily: typography.families.body,
    fontSize: 15,
    color: colors.text.tertiary,
  },

  /* Save */
  saveWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: DS.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  saveBtn: {
    borderRadius: radii.full,
    overflow: "hidden",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  saveBtnText: {
    fontFamily: typography.families.heading,
    fontSize: 16,
    color: "#0A1628",
  },
});
