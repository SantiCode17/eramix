import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radii, DS } from "@/design-system/tokens";
import type { GroupData, GroupsStackParamList } from "@/types/groups";
import * as groupsApi from "@/api/groups";
import { handleError } from "@/utils/errorHandler";
import { pluralize } from "@/utils/pluralize";

type Nav = StackNavigationProp<GroupsStackParamList, "GroupsList">;

// ── Helpers ─────────────────────────────────────────

function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "Ahora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function Avatar({ uri, name, size = 50 }: { uri: string | null; name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return uri ? (
    <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
  ) : (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "rgba(19,34,64,0.85)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: colors.eu.light, fontSize: size * 0.36, fontWeight: "700" }}>
        {initials}
      </Text>
    </View>
  );
}

// ── Group Item ──────────────────────────────────────

function GroupItem({ item, onPress, index }: { item: GroupData; onPress: () => void; index: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
      <Pressable style={styles.item} onPress={onPress}>
        <Avatar uri={item.avatarUrl} name={item.name} />
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={styles.groupName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.lastMessageAt && (
              <Text style={styles.time}>{relativeTime(item.lastMessageAt)}</Text>
            )}
          </View>
          <View style={styles.itemFooter}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage || "Sin mensajes aún"}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {item.unreadCount > 99 ? "99+" : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.memberCount}><Ionicons name="people-outline" size={13} color={colors.text.secondary} /> {pluralize(item.memberCount, "miembro", "miembros")}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ── Screen ──────────────────────────────────────────

export default function GroupsListScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      const data = await groupsApi.getMyGroups();
      setGroups(data);
    } catch (e) {
      handleError(e, "Groups.getMyGroups");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGroups();
  }, [fetchGroups]);

  const renderItem = useCallback(
    ({ item, index }: { item: GroupData; index: number }) => (
      <GroupItem
        item={item}
        index={index}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          nav.navigate("GroupChat", { groupId: item.id, groupName: item.name });
        }}
      />
    ),
    [nav],
  );

  if (loading) {
    return (
      <LinearGradient colors={[DS.background, "#0E1A35", "#0F1535"]} style={styles.center}>
        <ActivityIndicator size="large" color={colors.eu.star} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[DS.background, "#0E1A35", "#0F1535"]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Grupos</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            nav.navigate("CreateGroup");
          }}
        >
          <Text style={styles.addBtnText}>＋</Text>
        </Pressable>
      </View>

      {groups.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={56} color={colors.text.secondary} />
          <Text style={styles.emptyTitle}>No tienes grupos</Text>
          <Text style={styles.emptySubtitle}>
            Crea un grupo para chatear con varios amigos a la vez
          </Text>
          <Pressable style={styles.createBtn} onPress={() => nav.navigate("CreateGroup")}>
            <LinearGradient
              colors={["#FFD700", "#FF6B2B"]}
              style={styles.createBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.createBtnText}>Crear grupo</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        <FlashList
          data={groups}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.eu.star}
              colors={[colors.eu.star]}
            />
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        />
      )}
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.sizes.h2,
    fontFamily: typography.families.heading,
    color: colors.text.primary,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
  },
  addBtnText: { color: colors.text.primary, fontSize: 22, fontWeight: "700" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  itemContent: { flex: 1, marginLeft: spacing.md },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  groupName: {
    fontFamily: typography.families.subheading,
    ...typography.sizes.body,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  time: {
    fontFamily: typography.families.body,
    ...typography.sizes.bodySmall,
    color: colors.text.secondary,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  lastMessage: {
    fontFamily: typography.families.body,
    ...typography.sizes.caption,
    color: colors.text.secondary,
    flex: 1,
    marginRight: spacing.sm,
  },
  badge: {
    backgroundColor: colors.eu.orange,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  memberCount: {
    fontFamily: typography.families.body,
    ...typography.sizes.bodySmall,
    color: colors.text.secondary,
    marginTop: 2,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontFamily: typography.families.heading,
    ...typography.sizes.h3,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontFamily: typography.families.body,
    ...typography.sizes.body,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  createBtn: { marginTop: spacing.lg, borderRadius: radii.full, overflow: "hidden" },
  createBtnGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
  },
  createBtnText: {
    color: "#FFF",
    fontFamily: typography.families.subheading,
    ...typography.sizes.button,
    textAlign: "center",
  },
});
