import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator, Image, Alert,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { ChallengeSubmission, ChallengesStackParamList } from "@/types/challenges";
import * as challengeApi from "@/api/challenges";
import { handleError } from "@/utils/errorHandler";

type Route = RouteProp<ChallengesStackParamList, "ChallengeDetail">;

export default function ChallengeDetailScreen() {
  const nav = useNavigation();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { challengeId } = route.params;
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try { setSubmissions(await challengeApi.getSubmissions(challengeId)); }
    catch (e) { Alert.alert("Error al cargar", handleError(e, "ChallengeDetail.getSubmissions")); }
    finally { setLoading(false); }
  }, [challengeId]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleVote = async (subId: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await challengeApi.voteSubmission(subId);
      fetch();
    } catch (e) { Alert.alert("Error al votar", handleError(e, "ChallengeDetail.vote")); }
  };

  const renderItem = useCallback(
    ({ item, index }: { item: ChallengeSubmission; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
        <View style={styles.card}>
          <Image source={{ uri: item.photoUrl }} style={styles.photo} />
          <View style={styles.cardContent}>
            <View style={styles.userRow}>
              {item.userProfilePhotoUrl ? (
                <Image source={{ uri: item.userProfilePhotoUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPh]}>
                  <Text style={styles.avatarText}>{item.userFirstName?.[0] ?? "?"}</Text>
                </View>
              )}
              <Text style={styles.userName}>{item.userFirstName} {item.userLastName}</Text>
            </View>
            {item.caption && <Text style={styles.caption}>{item.caption}</Text>}
            <View style={styles.voteRow}>
              <Pressable
                style={[styles.voteBtn, item.votedByMe && styles.voteBtnActive]}
                onPress={() => !item.votedByMe && handleVote(item.id)}
              >
                <Text style={styles.voteEmoji}><Ionicons name={item.votedByMe ? "heart" : "heart-outline"} size={20} color={item.votedByMe ? colors.status.error : colors.text.secondary} /></Text>
                <Text style={[styles.voteCount, item.votedByMe && styles.voteCountActive]}>
                  {item.voteCount}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Animated.View>
    ), [fetch],
  );

  return (
    <LinearGradient colors={[colors.background.start, colors.background.end]} style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}><Text style={{ fontSize: 22 }}>←</Text></Pressable>
        <Text style={styles.headerTitle}>Participaciones</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.eu.star} /></View>
      ) : (
        <FlashList
          data={submissions}
          renderItem={renderItem}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 40 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="camera-outline" size={48} color={colors.text.secondary} />
              <Text style={styles.emptyTitle}>Sin participaciones aún</Text>
            </View>
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontFamily: typography.families.subheading, ...typography.sizes.body, color: colors.text.primary },
  card: { backgroundColor: colors.glass.white, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.glass.border, marginBottom: spacing.md, overflow: "hidden" },
  photo: { width: "100%", height: 250 },
  cardContent: { padding: spacing.md },
  userRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  avatarPh: { backgroundColor: colors.eu.mid, justifyContent: "center", alignItems: "center" },
  avatarText: { fontFamily: typography.families.subheading, ...typography.sizes.bodySmall, color: colors.text.primary },
  userName: { fontFamily: typography.families.subheading, ...typography.sizes.caption, color: colors.text.primary },
  caption: { fontFamily: typography.families.body, ...typography.sizes.caption, color: colors.text.secondary, marginTop: spacing.sm },
  voteRow: { flexDirection: "row", marginTop: spacing.sm },
  voteBtn: { flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: colors.glass.white, borderRadius: radii.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderWidth: 1, borderColor: colors.glass.border },
  voteBtnActive: { borderColor: colors.status.error },
  voteEmoji: { fontSize: 16 },
  voteCount: { fontFamily: typography.families.bodyMedium, ...typography.sizes.bodySmall, color: colors.text.secondary },
  voteCountActive: { color: colors.status.error },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing.xxl },
  emptyTitle: { fontFamily: typography.families.heading, ...typography.sizes.h3, color: colors.text.primary, marginTop: spacing.md },
});
