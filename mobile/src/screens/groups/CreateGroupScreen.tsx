import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import * as Haptics from "expo-haptics";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { GroupsStackParamList } from "@/types/groups";
import type { NearbyUserResponse } from "@/types/discover";
import * as groupsApi from "@/api/groups";
import { apiClient } from "@/api/client";

type Nav = StackNavigationProp<GroupsStackParamList, "CreateGroup">;

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export default function CreateGroupScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [friends, setFriends] = useState<NearbyUserResponse[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Fetch friends to add to group
  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get<ApiResponse<NearbyUserResponse[]>>(
          "/v1/friends",
        );
        setFriends(data.data);
      } catch (e) {
        console.error("Error fetching friends:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleFriend = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleCreate = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert("Error", "El nombre del grupo es obligatorio");
      return;
    }
    setCreating(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await groupsApi.createGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        memberIds: Array.from(selectedIds),
      });
      nav.goBack();
    } catch (e) {
      Alert.alert("Error", "No se pudo crear el grupo");
    } finally {
      setCreating(false);
    }
  }, [name, description, selectedIds, nav]);

  return (
    <LinearGradient
      colors={[colors.background.start, colors.background.end]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Nuevo Grupo</Text>
        <Pressable
          onPress={handleCreate}
          disabled={!name.trim() || creating}
          style={[styles.doneBtn, (!name.trim() || creating) && { opacity: 0.4 }]}
        >
          {creating ? (
            <ActivityIndicator size="small" color={colors.eu.star} />
          ) : (
            <Text style={styles.doneBtnText}>Crear</Text>
          )}
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Name */}
        <Text style={styles.label}>Nombre del grupo</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej: Erasmus Barcelona 2026"
            placeholderTextColor={colors.text.disabled}
            maxLength={100}
          />
        </View>

        {/* Description */}
        <Text style={styles.label}>Descripción (opcional)</Text>
        <View style={[styles.inputWrapper, { minHeight: 80 }]}>
          <TextInput
            style={[styles.input, { textAlignVertical: "top" }]}
            value={description}
            onChangeText={setDescription}
            placeholder="¿De qué trata este grupo?"
            placeholderTextColor={colors.text.disabled}
            multiline
            maxLength={500}
          />
        </View>

        {/* Friends selector */}
        <Text style={styles.label}>
          Añadir amigos ({selectedIds.size} seleccionados)
        </Text>
        {loading ? (
          <ActivityIndicator color={colors.eu.star} style={{ marginTop: spacing.md }} />
        ) : friends.length === 0 ? (
          <Text style={styles.emptyText}>No tienes amigos todavía</Text>
        ) : (
          friends.map((friend) => {
            const selected = selectedIds.has(friend.id);
            return (
              <Pressable
                key={friend.id}
                style={[styles.friendItem, selected && styles.friendSelected]}
                onPress={() => toggleFriend(friend.id)}
              >
                {friend.profilePhotoUrl ? (
                  <Image
                    source={{ uri: friend.profilePhotoUrl }}
                    style={styles.friendAvatar}
                  />
                ) : (
                  <View style={styles.friendAvatarPlaceholder}>
                    <Text style={styles.friendInitials}>
                      {friend.firstName.charAt(0)}
                    </Text>
                  </View>
                )}
                <Text style={styles.friendName}>
                  {friend.firstName} {friend.lastName}
                </Text>
                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                  {selected && <Text style={styles.check}>✓</Text>}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </LinearGradient>
  );
}

// ── Styles ──────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glass.border,
  },
  backBtn: { padding: spacing.sm },
  backText: { color: colors.text.primary, fontSize: 28, fontWeight: "300" },
  headerTitle: {
    fontFamily: typography.families.heading,
    ...typography.sizes.body,
    color: colors.text.primary,
  },
  doneBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  doneBtnText: {
    fontFamily: typography.families.subheading,
    ...typography.sizes.body,
    color: colors.eu.star,
  },
  scroll: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  label: {
    fontFamily: typography.families.bodyMedium,
    ...typography.sizes.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  inputWrapper: {
    backgroundColor: colors.glass.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: {
    fontFamily: typography.families.body,
    ...typography.sizes.body,
    color: colors.text.primary,
  },
  emptyText: {
    fontFamily: typography.families.body,
    ...typography.sizes.caption,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: spacing.md,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.xs,
  },
  friendSelected: {
    backgroundColor: colors.glass.white,
  },
  friendAvatar: { width: 40, height: 40, borderRadius: 20 },
  friendAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.eu.deep + "40",
    justifyContent: "center",
    alignItems: "center",
  },
  friendInitials: { color: colors.eu.light, fontSize: 16, fontWeight: "700" },
  friendName: {
    fontFamily: typography.families.bodyMedium,
    ...typography.sizes.body,
    color: colors.text.primary,
    flex: 1,
    marginLeft: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.glass.borderMid,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.eu.orange,
    borderColor: colors.eu.orange,
  },
  check: { color: "#FFF", fontSize: 14, fontWeight: "700" },
});
