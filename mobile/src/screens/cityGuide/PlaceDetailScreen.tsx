import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import { getPlace, getReviews, addReview } from "@/api/cityGuide";
import { handleError } from "@/utils/errorHandler";
import type { Place, PlaceReview, CityGuideStackParamList } from "@/types/cityGuide";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

const CATEGORY_ICONS: Record<string, IoniconsName> = {
  RESTAURANT: "restaurant",
  BAR: "beer",
  CAFE: "cafe",
  MUSEUM: "business",
  PARK: "leaf",
  NIGHTCLUB: "musical-notes",
  LIBRARY: "book",
  GYM: "barbell",
  SUPERMARKET: "cart",
  TRANSPORT: "bus",
  UNIVERSITY: "school",
  HOSPITAL: "medkit",
  OTHER: "location",
};

export default function PlaceDetailScreen() {
  const { params } = useRoute<RouteProp<CityGuideStackParamList, "PlaceDetail">>();
  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<PlaceReview[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [p, r] = await Promise.all([
          getPlace(params.placeId),
          getReviews(params.placeId),
        ]);
        setPlace(p as any);
        setReviews(r as any);
      } catch (e) {
        handleError(e, "PlaceDetail.load");
      }
    })();
  }, [params.placeId]);

  const handleReview = async () => {
    if (!comment.trim()) return;
    try {
      await addReview(params.placeId, { rating, comment: comment.trim() });
      setComment("");
      const r = await getReviews(params.placeId);
      setReviews(r as any);
      const p = await getPlace(params.placeId);
      setPlace(p as any);
    } catch (e) {
      Alert.alert("Error", handleError(e, "PlaceDetail.addReview"));
    }
  };

  if (!place) {
    return (
      <LinearGradient colors={[colors.background.start, colors.background.end]} style={styles.root}>
        <Text style={styles.loading}>Cargando…</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[colors.background.start, colors.background.end]} style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <Ionicons name={CATEGORY_ICONS[place.category] ?? "location"} size={48} color={colors.eu.star} />
          <Text style={styles.title}>{place.name}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
            <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
            <Text style={styles.cityLabel}>{place.city}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Row label="Categoría" value={place.category} />
          {place.address && <Row label="Dirección" value={place.address} />}
          <Row label="Rating" value={`${place.averageRating?.toFixed(1)} (${place.reviewCount})`} icon="star" />
        </View>

        {place.description ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.desc}>{place.description}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dejar reseña</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setRating(s)}>
                <Text style={[styles.star, s <= rating && styles.starActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu comentario…"
            placeholderTextColor={colors.text.secondary}
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <TouchableOpacity style={styles.btn} onPress={handleReview}>
            <Text style={styles.btnText}>Enviar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reseñas ({reviews.length})</Text>
          {reviews.length === 0 && <Text style={styles.empty}>Sin reseñas aún</Text>}
          {reviews.map((r) => (
            <View key={r.id} style={styles.review}>
              <Text style={styles.reviewRating}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</Text>
              {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: IoniconsName }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        {icon && <Ionicons name={icon} size={14} color={colors.eu.star} />}
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 60, paddingHorizontal: spacing.md },
  loading: {
    fontFamily: typography.families.body,
    ...typography.sizes.body,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 100,
  },
  header: { alignItems: "center", marginBottom: spacing.lg },
  emojiLarge: { fontSize: 48 },
  title: {
    ...typography.sizes.h2,
    fontFamily: typography.families.heading,
    color: colors.text.primary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  cityLabel: {
    fontFamily: typography.families.body,
    ...typography.sizes.caption,
    color: colors.text.secondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.glass.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  sectionTitle: {
    fontFamily: typography.families.subheading,
    ...typography.sizes.body,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  desc: {
    fontFamily: typography.families.body,
    ...typography.sizes.caption,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  rowLabel: {
    fontFamily: typography.families.body,
    ...typography.sizes.caption,
    color: colors.text.secondary,
  },
  rowValue: {
    fontFamily: typography.families.bodyMedium,
    ...typography.sizes.caption,
    color: colors.text.primary,
  },
  starsRow: { flexDirection: "row", marginBottom: spacing.sm },
  star: { fontSize: 28, color: "rgba(255,255,255,0.2)", marginRight: 4 },
  starActive: { color: colors.eu.star },
  input: {
    backgroundColor: colors.glass.white,
    borderRadius: radii.md,
    padding: spacing.sm,
    color: colors.text.primary,
    fontFamily: typography.families.body,
    ...typography.sizes.caption,
    minHeight: 60,
    textAlignVertical: "top",
    marginBottom: spacing.sm,
  },
  btn: {
    backgroundColor: colors.eu.deep,
    borderRadius: radii.full,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontFamily: typography.families.bodyBold,
    ...typography.sizes.button,
  },
  review: {
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
    paddingVertical: spacing.sm,
  },
  reviewRating: { color: colors.eu.star, fontSize: 16 },
  reviewComment: {
    fontFamily: typography.families.body,
    ...typography.sizes.caption,
    color: colors.text.secondary,
    marginTop: 4,
  },
  empty: {
    fontFamily: typography.families.body,
    ...typography.sizes.caption,
    color: colors.text.secondary,
    textAlign: "center",
  },
});
