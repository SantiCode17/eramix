import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInRight } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { DS } from "@/design-system/tokens";
import { activityFeedApi, ActivityFeedItem } from "@/api/socialFeatures";

const FEED_TYPE_CONFIG: Record<
  string,
  { icon: string; color: string; label: string }
> = {
  ACHIEVEMENT: { icon: "trophy", color: "#FFD700", label: "Desbloqueó un logro" },
  EVENT_JOIN: { icon: "calendar", color: "#4FD1C5", label: "Se unió a un evento" },
  FRIEND_ADD: { icon: "person-add", color: "#63B3ED", label: "Nueva amistad" },
  STORY: { icon: "camera", color: "#9F7AEA", label: "Publicó una story" },
  POST: { icon: "document-text", color: "#FC8181", label: "Publicó en comunidad" },
  LEVEL_UP: { icon: "arrow-up-circle", color: "#F6E05E", label: "Subió de nivel" },
};

export default function ActivityFeedScreen() {
  const { data: feed = [], isLoading, refetch } = useQuery({
    queryKey: ["activityFeed"],
    queryFn: () => activityFeedApi.getFeed(0, 30),
  });

  const renderItem = ({ item, index }: { item: ActivityFeedItem; index: number }) => {
    const config = FEED_TYPE_CONFIG[item.type] ?? FEED_TYPE_CONFIG.ACHIEVEMENT;

    return (
      <Animated.View entering={FadeInRight.delay(index * 60).springify()}>
        <View style={styles.feedItem}>
          {/* Timeline dot + line */}
          <View style={styles.timeline}>
            <View style={[styles.dot, { backgroundColor: config.color }]}>
              <Ionicons name={config.icon as any} size={12} color="#fff" />
            </View>
            {index < feed.length - 1 && <View style={styles.line} />}
          </View>

          {/* Content */}
          <View style={styles.feedContent}>
            <View style={styles.feedHeader}>
              <Image
                source={{
                  uri:
                    item.userProfilePhotoUrl ??
                    `https://ui-avatars.com/api/?name=${item.userFirstName}&background=132240&color=F5A623&size=100`,
                }}
                style={styles.avatar}
              />
              <View style={styles.feedTextBlock}>
                <Text style={styles.feedUser}>
                  {item.userFirstName} {item.userLastName}
                </Text>
                <Text style={[styles.feedType, { color: config.color }]}>
                  {config.label}
                </Text>
              </View>
              <Text style={styles.feedTime}>
                {formatTimeAgo(item.createdAt)}
              </Text>
            </View>

            <View style={styles.feedBody}>
              <Text style={styles.feedTitle}>{item.title}</Text>
              {item.body ? (
                <Text style={styles.feedDescription} numberOfLines={2}>
                  {item.body}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={DS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[DS.background, "#0E1A35", DS.background]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity Feed</Text>
        <Text style={styles.headerSubtitle}>
          Qué están haciendo tus amigos Erasmus
        </Text>
      </View>

      <FlatList
        data={feed}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isLoading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={60} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyText}>
              Sin actividad reciente. ¡Conecta con más Erasmus!
            </Text>
          </View>
        }
      />
    </View>
  );
}

function formatTimeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "ahora";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  } catch {
    return "";
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.background },
  center: {
    flex: 1,
    backgroundColor: DS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  headerTitle: { color: "#fff", fontSize: 28, fontWeight: "800" },
  headerSubtitle: { color: DS.textSecondary, fontSize: 13, marginTop: 4 },

  listContent: { paddingHorizontal: 20, paddingBottom: 100 },

  feedItem: { flexDirection: "row", marginBottom: 4 },

  // Timeline
  timeline: { alignItems: "center", width: 36, marginRight: 12 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 4,
  },

  // Content
  feedContent: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  feedHeader: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: DS.surface,
  },
  feedTextBlock: { flex: 1 },
  feedUser: { color: "#fff", fontSize: 14, fontWeight: "700" },
  feedType: { fontSize: 11, marginTop: 1 },
  feedTime: { color: DS.textSecondary, fontSize: 11 },

  feedBody: { marginTop: 10 },
  feedTitle: { color: "#fff", fontSize: 14, fontWeight: "600" },
  feedDescription: {
    color: DS.textSecondary,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },

  emptyContainer: { alignItems: "center", paddingTop: 60 },
  emptyText: {
    color: DS.textSecondary,
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
