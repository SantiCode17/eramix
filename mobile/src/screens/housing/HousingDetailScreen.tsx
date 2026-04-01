import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView, Image, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { HousingPost, HousingStackParamList } from "@/types/housing";
import * as housingApi from "@/api/housing";
import { handleError } from "@/utils/errorHandler";

type Route = RouteProp<HousingStackParamList, "HousingDetail">;

export default function HousingDetailScreen() {
  const nav = useNavigation();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { postId } = route.params;
  const [post, setPost] = useState<HousingPost | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const all = await housingApi.getAllPosts();
      setPost(all.find((p) => p.id === postId) || null);
    } catch (e) { Alert.alert("Error al cargar", handleError(e, "HousingDetail.fetch")); }
    finally { setLoading(false); }
  }, [postId]);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) {
    return (
      <LinearGradient colors={[colors.background.start, colors.background.end]} style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.center}><ActivityIndicator size="large" color={colors.eu.star} /></View>
      </LinearGradient>
    );
  }

  if (!post) {
    return (
      <LinearGradient colors={[colors.background.start, colors.background.end]} style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.center}><Text style={styles.emptyTitle}>Anuncio no encontrado</Text></View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[colors.background.start, colors.background.end]} style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}><Text style={{ fontSize: 22 }}>←</Text></Pressable>
        <Text style={styles.headerTitle}>Detalle</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {post.photoUrl && <Image source={{ uri: post.photoUrl }} style={styles.photo} />}
        <View style={styles.card}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{post.postType === "OFFER" ? "🏠 Oferta" : "🔍 Busca"}</Text>
          </View>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.desc}>{post.description}</Text>

          <View style={styles.infoRow}><Text style={styles.label}>Ciudad</Text><Text style={styles.value}>📍 {post.city}</Text></View>
          {post.address && <View style={styles.infoRow}><Text style={styles.label}>Dirección</Text><Text style={styles.value}>{post.address}</Text></View>}
          <View style={styles.infoRow}><Text style={styles.label}>Precio</Text><Text style={styles.valueHighlight}>{post.monthlyRent}€/mes</Text></View>
          <View style={styles.infoRow}><Text style={styles.label}>Habitaciones</Text><Text style={styles.value}>{post.roomsAvailable}</Text></View>
          <View style={styles.infoRow}><Text style={styles.label}>Disponible desde</Text><Text style={styles.value}>{post.availableFrom}</Text></View>
          {post.availableUntil && <View style={styles.infoRow}><Text style={styles.label}>Hasta</Text><Text style={styles.value}>{post.availableUntil}</Text></View>}

          <View style={styles.authorRow}>
            <Text style={styles.authorLabel}>Publicado por</Text>
            <Text style={styles.authorName}>{post.userFirstName} {post.userLastName}</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontFamily: typography.families.subheading, ...typography.sizes.body, color: colors.text.primary },
  content: { padding: spacing.lg },
  photo: { width: "100%", height: 220, borderRadius: radii.lg, marginBottom: spacing.md },
  card: { backgroundColor: colors.glass.white, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.glass.border, padding: spacing.lg },
  typeBadge: { alignSelf: "flex-start", backgroundColor: colors.eu.star + "20", borderRadius: radii.full, paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs },
  typeText: { fontFamily: typography.families.bodyMedium, ...typography.sizes.small, color: colors.eu.star },
  title: { fontFamily: typography.families.heading, ...typography.sizes.h3, color: colors.text.primary, marginTop: spacing.sm },
  desc: { fontFamily: typography.families.body, ...typography.sizes.body, color: colors.text.secondary, marginTop: spacing.sm },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.md },
  label: { fontFamily: typography.families.bodyMedium, ...typography.sizes.caption, color: colors.text.secondary },
  value: { fontFamily: typography.families.body, ...typography.sizes.body, color: colors.text.primary },
  valueHighlight: { fontFamily: typography.families.heading, ...typography.sizes.body, color: colors.eu.star },
  authorRow: { marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.glass.border },
  authorLabel: { fontFamily: typography.families.body, ...typography.sizes.small, color: colors.text.secondary },
  authorName: { fontFamily: typography.families.subheading, ...typography.sizes.body, color: colors.text.primary, marginTop: spacing.xs },
  emptyTitle: { fontFamily: typography.families.heading, ...typography.sizes.h3, color: colors.text.primary },
});
