import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import * as Haptics from "expo-haptics";
import { useAuthStore } from "@/store/useAuthStore";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { GroupData, GroupMember, GroupsStackParamList } from "@/types/groups";
import * as groupsApi from "@/api/groups";
import { handleError } from "@/utils/errorHandler";

type Route = RouteProp<GroupsStackParamList, "GroupSettings">;
type Nav = StackNavigationProp<GroupsStackParamList, "GroupSettings">;

export default function GroupSettingsScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { groupId } = route.params;
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [group, setGroup] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await groupsApi.getGroup(groupId);
        setGroup(data);
      } catch (e) {
        handleError(e, "GroupSettings.getGroup");
      } finally {
        setLoading(false);
      }
    })();
  }, [groupId]);

  const isAdmin = group?.members.some(
    (m) => m.userId === currentUserId && m.role === "ADMIN",
  );

  const handleLeave = useCallback(() => {
    Alert.alert("Salir del grupo", "¿Estás seguro de que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          try {
            await groupsApi.leaveGroup(groupId);
            nav.popToTop();
          } catch (e) {
            Alert.alert("Error", handleError(e, "GroupSettings.leave"));
          }
        },
      },
    ]);
  }, [groupId, nav]);

  const handleRemoveMember = useCallback(
    (userId: number, memberName: string) => {
      Alert.alert("Eliminar miembro", `¿Eliminar a ${memberName}?`, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await groupsApi.removeMember(groupId, userId);
              setGroup((prev) =>
                prev
                  ? {
                      ...prev,
                      members: prev.members.filter((m) => m.userId !== userId),
                      memberCount: prev.memberCount - 1,
                    }
                  : prev,
              );
            } catch (e) {
              Alert.alert("Error", handleError(e, "GroupSettings.removeMember"));
            }
          },
        },
      ]);
    },
    [groupId],
  );

  if (loading || !group) {
    return (
      <LinearGradient colors={[colors.background.start, colors.background.end]} style={styles.center}>
        <ActivityIndicator size="large" color={colors.eu.star} />
      </LinearGradient>
    );
  }

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
        <Text style={styles.headerTitle}>Info del Grupo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Group info card */}
        <View style={styles.card}>
          <View style={styles.groupInfo}>
            {group.avatarUrl ? (
              <Image source={{ uri: group.avatarUrl }} style={styles.groupAvatar} />
            ) : (
              <View style={styles.groupAvatarPlaceholder}>
                <Text style={styles.groupInitials}>
                  {group.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.groupName}>{group.name}</Text>
            {group.description && (
              <Text style={styles.groupDesc}>{group.description}</Text>
            )}
            <Text style={styles.groupMeta}>
              👥 {group.memberCount}/{group.maxMembers} miembros
            </Text>
          </View>
        </View>

        {/* Members */}
        <Text style={styles.sectionTitle}>
          Miembros ({group.members.length})
        </Text>
        {group.members.map((member) => (
          <View key={member.userId} style={styles.memberItem}>
            {member.profilePhotoUrl ? (
              <Image source={{ uri: member.profilePhotoUrl }} style={styles.memberAvatar} />
            ) : (
              <View style={styles.memberAvatarPlaceholder}>
                <Text style={styles.memberInitials}>
                  {member.firstName.charAt(0)}
                </Text>
              </View>
            )}
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>
                {member.firstName} {member.lastName}
                {member.userId === currentUserId ? " (tú)" : ""}
              </Text>
              <Text style={styles.memberRole}>
                {member.role === "ADMIN" ? "👑 Admin" : "Miembro"}
              </Text>
            </View>
            {isAdmin && member.userId !== currentUserId && (
              <Pressable
                onPress={() =>
                  handleRemoveMember(member.userId, `${member.firstName} ${member.lastName}`)
                }
                style={styles.removeBtn}
              >
                <Text style={styles.removeBtnText}>✕</Text>
              </Pressable>
            )}
          </View>
        ))}

        {/* Leave group */}
        <Pressable style={styles.leaveBtn} onPress={handleLeave}>
          <Text style={styles.leaveBtnText}>Salir del grupo</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

// ── Styles ──────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  scroll: { flex: 1, paddingHorizontal: spacing.lg },
  card: {
    backgroundColor: colors.glass.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  groupInfo: { alignItems: "center" },
  groupAvatar: { width: 80, height: 80, borderRadius: 40 },
  groupAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.eu.deep + "40",
    justifyContent: "center",
    alignItems: "center",
  },
  groupInitials: { color: colors.eu.light, fontSize: 32, fontWeight: "700" },
  groupName: {
    fontFamily: typography.families.heading,
    ...typography.sizes.h3,
    color: colors.text.primary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  groupDesc: {
    fontFamily: typography.families.body,
    ...typography.sizes.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  groupMeta: {
    fontFamily: typography.families.body,
    ...typography.sizes.small,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontFamily: typography.families.subheading,
    ...typography.sizes.body,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glass.border,
  },
  memberAvatar: { width: 40, height: 40, borderRadius: 20 },
  memberAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.eu.deep + "40",
    justifyContent: "center",
    alignItems: "center",
  },
  memberInitials: { color: colors.eu.light, fontSize: 16, fontWeight: "700" },
  memberInfo: { flex: 1, marginLeft: spacing.md },
  memberName: {
    fontFamily: typography.families.bodyMedium,
    ...typography.sizes.body,
    color: colors.text.primary,
  },
  memberRole: {
    fontFamily: typography.families.body,
    ...typography.sizes.small,
    color: colors.text.secondary,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.status.error + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  removeBtnText: { color: colors.status.error, fontSize: 14, fontWeight: "700" },
  leaveBtn: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.status.error + "15",
    alignItems: "center",
  },
  leaveBtnText: {
    fontFamily: typography.families.subheading,
    ...typography.sizes.body,
    color: colors.status.error,
  },
});
