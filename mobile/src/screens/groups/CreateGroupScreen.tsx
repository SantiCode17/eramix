/**
 * CreateGroupScreen — Eramix
 * Diseño profesional. Sin animaciones artificiales. Sin sección "Fecha Especial".
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

import { colors, typography, spacing, radii, DS } from "@/design-system/tokens";
import { handleError } from "@/utils/errorHandler";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import { apiClient } from "@/api/client";

interface FriendEntry {
  id: number;
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string | null;
}

function SectionTitle({ label }: { label: string }) {
  return <Text style={s.sectionTitle}>{label}</Text>;
}

function FriendRow({ friend, selected, onPress }: { friend: FriendEntry; selected: boolean; onPress: () => void }) {
  const initials = `${(friend.firstName || "?")[0]}${(friend.lastName || "?")[0]}`.toUpperCase();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.friendRow, selected && s.friendRowSelected, pressed && { backgroundColor: "rgba(255,255,255,0.04)" }]}
    >
      <View style={s.friendLeft}>
        {friend.profilePhotoUrl ? (
          <Image source={{ uri: resolveMediaUrl(friend.profilePhotoUrl) }} style={s.friendAvatar} />
        ) : (
          <LinearGradient colors={["rgba(255,215,0,0.15)", "rgba(19,34,64,0.6)"]} style={s.friendAvatarFallback}>
            <Text style={s.friendInitials}>{initials}</Text>
          </LinearGradient>
        )}
        <View>
          <Text style={s.friendName}>{friend.firstName} {friend.lastName}</Text>
          <Text style={s.friendSub}>Amigo/a en Eramix</Text>
        </View>
      </View>
      <View style={[s.checkCircle, selected && s.checkCircleActive]}>
        {selected && <Ionicons name="checkmark" size={13} color="#000" />}
      </View>
    </Pressable>
  );
}

function SelectedPill({ friend, onRemove }: { friend: FriendEntry; onRemove: () => void }) {
  const initials = `${(friend.firstName || "?")[0]}${(friend.lastName || "?")[0]}`.toUpperCase();
  return (
    <View style={s.pill}>
      {friend.profilePhotoUrl ? (
        <Image source={{ uri: resolveMediaUrl(friend.profilePhotoUrl) }} style={s.pillAvatar} />
      ) : (
        <LinearGradient colors={["rgba(255,215,0,0.2)", "rgba(19,34,64,0.6)"]} style={s.pillAvatarFallback}>
          <Text style={s.pillInitials}>{initials}</Text>
        </LinearGradient>
      )}
      <Text style={s.pillName} numberOfLines={1}>{friend.firstName}</Text>
      <Pressable onPress={onRemove} hitSlop={8} style={s.pillRemove}>
        <Ionicons name="close" size={10} color="rgba(255,255,255,0.6)" />
      </Pressable>
    </View>
  );
}

export default function CreateGroupScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get<{ data: any[] }>("/v1/friends");
        const list = (res.data.data || []).map((f) => ({
          id: f.friendId,
          firstName: f.friendFirstName,
          lastName: f.friendLastName,
          profilePhotoUrl: f.friendProfilePhotoUrl,
        }));
        setFriends(list);
      } catch (e) {
        handleError(e, "CreateGroup.fetchFriends");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredFriends = useMemo(() => {
    if (!search.trim()) return friends;
    const q = search.toLowerCase();
    return friends.filter((f) => `${f.firstName} ${f.lastName}`.toLowerCase().includes(q));
  }, [friends, search]);

  const selectedFriends = useMemo(() => friends.filter((f) => selectedIds.has(f.id)), [friends, selectedIds]);

  const handlePickAvatar = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.85 });
      if (!res.canceled && res.assets[0]?.uri) setAvatarUri(res.assets[0].uri);
    } catch {}
  };

  const toggleFriend = useCallback((id: number) => {
    Haptics.selectionAsync();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) { Alert.alert("Falta el nombre", "Ponle nombre a tu grupo."); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitting(true);
    try {
      let uploadedAvatarUrl: string | null = null;
      if (avatarUri) {
        try {
          const form = new FormData();
          const ext = avatarUri.split(".").pop() ?? "jpg";
          form.append("file", { uri: avatarUri, name: `avatar.${ext}`, type: `image/${ext === "png" ? "png" : "jpeg"}` } as any);
          const uploadRes = await apiClient.post<{ data: string }>("/v1/media/upload", form, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          uploadedAvatarUrl = uploadRes.data.data;
        } catch {}
      }
      const payload: Record<string, unknown> = { name: name.trim() };
      if (description.trim()) payload.description = description.trim();
      if (uploadedAvatarUrl) payload.avatarUrl = uploadedAvatarUrl;
      if (selectedIds.size > 0) payload.memberIds = Array.from(selectedIds);
      const res = await apiClient.post<{ data: any }>("/v1/groups", payload);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
      navigation.navigate("GroupChat", { groupId: res.data.data.id, groupName: res.data.data.name });
    } catch (e) {
      Alert.alert("Error al crear", handleError(e, "CreateGroup.submit"));
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = name.trim().length >= 2 && !submitting;

  return (
    <View style={s.root}>
      <LinearGradient colors={[DS.background, "#0E1A35", "#0A0A1E"]} style={StyleSheet.absoluteFill} />

      {/* Cabecera */}
      <View style={[s.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={({ pressed }) => [s.headerBtn, pressed && { opacity: 0.6 }]}>
          <Ionicons name="close" size={22} color={colors.text.primary} />
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Nuevo Grupo</Text>
          <Text style={s.headerSub}>
            {selectedIds.size > 0
              ? `${selectedIds.size} miembro${selectedIds.size !== 1 ? "s" : ""} seleccionado${selectedIds.size !== 1 ? "s" : ""}`
              : "Convoca a tus amigos"}
          </Text>
        </View>
        <Pressable
          onPress={handleCreate}
          disabled={!canSubmit}
          style={({ pressed }) => [s.createBtn, !canSubmit && s.createBtnDisabled, pressed && { opacity: 0.8 }]}
        >
          {submitting
            ? <ActivityIndicator size="small" color="#000" />
            : <Text style={s.createBtnText}>Crear</Text>
          }
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* IDENTIDAD */}
          <View style={s.section}>
            <SectionTitle label="IDENTIDAD DEL GRUPO" />
            <View style={s.card}>
              {/* Avatar */}
              <View style={s.avatarSection}>
                <Pressable onPress={handlePickAvatar} style={s.avatarWrap}>
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={s.avatarImg} />
                  ) : (
                    <LinearGradient colors={["rgba(255,215,0,0.1)", "rgba(19,34,64,0.7)"]} style={s.avatarPlaceholder}>
                      <Ionicons name="camera-outline" size={28} color={colors.eu.star} />
                    </LinearGradient>
                  )}
                  <View style={s.avatarEditBadge}>
                    <LinearGradient colors={["#FFE566", "#D4AF37"]} style={StyleSheet.absoluteFill} />
                    <Ionicons name="pencil" size={11} color="#000" />
                  </View>
                </Pressable>
                <Text style={s.avatarHint}>Foto del grupo</Text>
              </View>

              <View style={s.cardDivider} />

              {/* Nombre */}
              <View style={[s.inputRow, focusedInput === "name" && s.inputRowFocused]}>
                <Ionicons name="people-outline" size={18} color={focusedInput === "name" ? colors.eu.star : "rgba(255,255,255,0.3)"} style={s.inputIcon} />
                <TextInput
                  style={[s.input, { fontSize: 17 }]}
                  placeholder="Nombre del grupo *"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={name}
                  onChangeText={setName}
                  maxLength={40}
                  onFocus={() => setFocusedInput("name")}
                  onBlur={() => setFocusedInput(null)}
                  returnKeyType="next"
                />
                {name.length > 0 && <Text style={s.charCount}>{name.length}/40</Text>}
              </View>
              <View style={s.cardDivider} />

              {/* Descripción */}
              <View style={[s.inputRow, { alignItems: "flex-start", paddingVertical: spacing.md }, focusedInput === "desc" && s.inputRowFocused]}>
                <Ionicons name="document-text-outline" size={18} color={focusedInput === "desc" ? colors.eu.star : "rgba(255,255,255,0.3)"} style={[s.inputIcon, { marginTop: 2 }]} />
                <TextInput
                  style={[s.input, { minHeight: 60, textAlignVertical: "top" }]}
                  placeholder="Descripción (opcional)"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  maxLength={250}
                  onFocus={() => setFocusedInput("desc")}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>
          </View>

          {/* MIEMBROS */}
          <View style={s.section}>
            <SectionTitle label={`MIEMBROS${friends.length > 0 ? ` (${friends.length} amigos)` : ""}`} />

            {/* Pills de seleccionados */}
            {selectedFriends.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillsScroll} style={s.pillsWrap}>
                {selectedFriends.map((f) => (
                  <SelectedPill key={f.id} friend={f} onRemove={() => toggleFriend(f.id)} />
                ))}
              </ScrollView>
            )}

            {/* Búsqueda */}
            <View style={[s.searchBar, focusedInput === "search" && s.searchBarFocused]}>
              <Ionicons name="search-outline" size={16} color={focusedInput === "search" ? colors.eu.star : "rgba(255,255,255,0.3)"} style={{ marginRight: 8 }} />
              <TextInput
                style={s.searchInput}
                placeholder="Buscar amigos..."
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={search}
                onChangeText={setSearch}
                onFocus={() => setFocusedInput("search")}
                onBlur={() => setFocusedInput(null)}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.4)" />
                </Pressable>
              )}
            </View>

            {/* Lista amigos */}
            <View style={s.friendsCard}>
              {loading ? (
                <View style={s.centeredState}>
                  <ActivityIndicator color={colors.eu.star} />
                  <Text style={s.stateText}>Cargando amigos...</Text>
                </View>
              ) : filteredFriends.length === 0 ? (
                <View style={s.centeredState}>
                  <Ionicons name="people-outline" size={36} color="rgba(255,255,255,0.2)" />
                  <Text style={s.stateText}>
                    {search.trim() ? "Sin resultados" : "Aún no tienes amigos en Eramix"}
                  </Text>
                </View>
              ) : (
                filteredFriends.map((f, idx) => (
                  <View key={f.id}>
                    {idx > 0 && <View style={s.listDivider} />}
                    <FriendRow friend={f} selected={selectedIds.has(f.id)} onPress={() => toggleFriend(f.id)} />
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const AVATAR_SIZE = 80;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerBtn: { width: 40, alignItems: "center" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontFamily: typography.families.heading, fontSize: 18, color: colors.text.primary },
  headerSub: { fontFamily: typography.families.body, fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 },
  createBtn: {
    backgroundColor: colors.eu.star,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 2,
    minWidth: 72,
    alignItems: "center",
  },
  createBtnDisabled: { backgroundColor: "rgba(255,215,0,0.25)" },
  createBtnText: { fontFamily: typography.families.subheading, fontSize: 14, color: "#000" },

  scroll: { gap: 0 },
  section: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  sectionTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  cardDivider: { height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.06)", marginLeft: 50 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  inputRowFocused: { backgroundColor: "rgba(255,215,0,0.03)" },
  inputIcon: { width: 22, textAlign: "center" },
  input: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: 15,
    color: colors.text.primary,
    paddingVertical: spacing.xs,
  },
  charCount: { fontFamily: typography.families.body, fontSize: 11, color: "rgba(255,255,255,0.3)" },

  avatarSection: { alignItems: "center", paddingVertical: spacing.xl },
  avatarWrap: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, overflow: "hidden", position: "relative" },
  avatarImg: { width: AVATAR_SIZE, height: AVATAR_SIZE, resizeMode: "cover" },
  avatarPlaceholder: { width: AVATAR_SIZE, height: AVATAR_SIZE, alignItems: "center", justifyContent: "center" },
  avatarEditBadge: {
    position: "absolute", bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
    borderWidth: 2, borderColor: DS.background,
  },
  avatarHint: { fontFamily: typography.families.body, fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: spacing.xs },

  pillsWrap: { marginBottom: spacing.sm },
  pillsScroll: { gap: spacing.sm, paddingHorizontal: 0, paddingVertical: spacing.xs },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,215,0,0.08)",
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,215,0,0.2)",
    paddingVertical: spacing.xs,
    paddingLeft: spacing.xs,
    paddingRight: spacing.sm,
    gap: spacing.xs,
  },
  pillAvatar: { width: 24, height: 24, borderRadius: 12 },
  pillAvatarFallback: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  pillInitials: { fontFamily: typography.families.subheading, fontSize: 9, color: colors.eu.star },
  pillName: { fontFamily: typography.families.bodyMedium, fontSize: 12, color: colors.text.primary, maxWidth: 60 },
  pillRemove: { padding: 2 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchBarFocused: { borderColor: "rgba(255,215,0,0.3)", backgroundColor: "rgba(255,215,0,0.03)" },
  searchInput: { flex: 1, fontFamily: typography.families.body, fontSize: 14, color: colors.text.primary },

  friendsCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
    marginBottom: spacing.xl,
  },
  listDivider: { height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.06)", marginLeft: 68 },
  centeredState: { alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.sm },
  stateText: { fontFamily: typography.families.body, fontSize: 14, color: "rgba(255,255,255,0.35)", textAlign: "center" },

  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  friendRowSelected: { backgroundColor: "rgba(255,215,0,0.04)" },
  friendLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md, flex: 1 },
  friendAvatar: { width: 44, height: 44, borderRadius: 22 },
  friendAvatarFallback: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  friendInitials: { fontFamily: typography.families.subheading, fontSize: 14, color: colors.eu.star },
  friendName: { fontFamily: typography.families.bodyMedium, fontSize: 14, color: colors.text.primary },
  friendSub: { fontFamily: typography.families.body, fontSize: 12, color: "rgba(255,255,255,0.4)" },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  checkCircleActive: { backgroundColor: colors.eu.star, borderColor: colors.eu.star },
});
