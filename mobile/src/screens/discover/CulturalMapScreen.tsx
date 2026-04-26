/**
 * ════════════════════════════════════════════════════
 *  V.3 · Interactive Cultural Map
 *  European Glass DS · Category filter chips · POI cards
 * ════════════════════════════════════════════════════
 */
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInRight,
  SlideInRight,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { DS } from "@/design-system/tokens";

// ── Cultural Point of Interest ──
interface CulturalPOI {
  id: number;
  name: string;
  description: string;
  category: CulturalCategory;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  distance: string;
  address: string;
  isFavorite: boolean;
  tags: string[];
}

type CulturalCategory =
  | "MUSEUM"
  | "FOOD"
  | "LANDMARK"
  | "NIGHTLIFE"
  | "PARK"
  | "MARKET"
  | "MUSIC"
  | "FESTIVAL";

const CATEGORY_CONFIG: Record<
  CulturalCategory,
  { icon: string; label: string; color: string }
> = {
  MUSEUM:    { icon: "business",        label: "Museos",     color: "#9F7AEA" },
  FOOD:      { icon: "restaurant",      label: "Comida",     color: "#F6AD55" },
  LANDMARK:  { icon: "flag",            label: "Monumentos", color: "#4FD1C5" },
  NIGHTLIFE: { icon: "moon",            label: "Nightlife",  color: "#FC8181" },
  PARK:      { icon: "leaf",            label: "Parques",    color: "#68D391" },
  MARKET:    { icon: "cart",            label: "Mercados",   color: "#63B3ED" },
  MUSIC:     { icon: "musical-notes",   label: "Música",     color: "#F687B3" },
  FESTIVAL:  { icon: "sparkles",        label: "Festivales", color: "#FFD700" },
};

// ── Mock Data ──
const MOCK_POIS: CulturalPOI[] = [
  {
    id: 1, name: "Museo del Prado", description: "Una de las pinacotecas más importantes del mundo con obras de Velázquez, Goya y El Greco.",
    category: "MUSEUM", imageUrl: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=400",
    rating: 4.8, reviewCount: 2340, distance: "1.2 km", address: "Paseo del Prado, s/n", isFavorite: true, tags: ["Arte", "Historia"],
  },
  {
    id: 2, name: "Mercado de San Miguel", description: "Mercado gastronómico con tapas, vinos y productos gourmet locales.",
    category: "FOOD", imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
    rating: 4.5, reviewCount: 1890, distance: "0.8 km", address: "Plaza de San Miguel, s/n", isFavorite: false, tags: ["Tapas", "Gourmet"],
  },
  {
    id: 3, name: "Retiro Park", description: "Parque urbano con lago, Palacio de Cristal y jardines históricos.",
    category: "PARK", imageUrl: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=400",
    rating: 4.7, reviewCount: 3100, distance: "0.5 km", address: "Parque del Retiro", isFavorite: true, tags: ["Naturaleza", "Relajación"],
  },
  {
    id: 4, name: "Kapital Club", description: "Discoteca de 7 plantas con diferentes estilos musicales cada noche.",
    category: "NIGHTLIFE", imageUrl: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=400",
    rating: 4.1, reviewCount: 890, distance: "2.1 km", address: "Calle de Atocha, 125", isFavorite: false, tags: ["Electrónica", "Latino"],
  },
  {
    id: 5, name: "Puerta del Sol", description: "Plaza central icónica con el Kilómetro Cero y el Oso y el Madroño.",
    category: "LANDMARK", imageUrl: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400",
    rating: 4.6, reviewCount: 5200, distance: "0.3 km", address: "Puerta del Sol", isFavorite: false, tags: ["Icónico", "Centro"],
  },
  {
    id: 6, name: "El Rastro", description: "El mercadillo al aire libre más grande de Madrid cada domingo.",
    category: "MARKET", imageUrl: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400",
    rating: 4.3, reviewCount: 1450, distance: "1.8 km", address: "Calle de la Ribera de Curtidores", isFavorite: true, tags: ["Vintage", "Domingos"],
  },
];

export default function CulturalMapScreen() {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState<CulturalCategory | "ALL">("ALL");
  const [selectedPOI, setSelectedPOI] = useState<CulturalPOI | null>(null);

  const filteredPOIs = useMemo(
    () =>
      activeCategory === "ALL"
        ? MOCK_POIS
        : MOCK_POIS.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[DS.background, "#0E1A35", DS.background]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Mapa Cultural</Text>
          <Text style={styles.headerSubtitle}>
            Descubre lo mejor de tu ciudad Erasmus
          </Text>
        </View>
        <Pressable style={styles.searchBtn}>
          <Ionicons name="search" size={20} color={DS.textSecondary} />
        </Pressable>
      </View>

      {/* Map Placeholder (Glass card) */}
      <Animated.View entering={FadeInDown.springify()} style={styles.mapCard}>
        <LinearGradient
          colors={["rgba(19,34,64,0.8)", "rgba(10,22,40,0.9)"]}
          style={styles.mapInner}
        >
          <Ionicons name="map" size={48} color="rgba(255,255,255,0.12)" />
          <Text style={styles.mapPlaceholder}>
            🗺️ Mapa interactivo
          </Text>
          <Text style={styles.mapSubtext}>
            {filteredPOIs.length} lugares culturales cerca de ti
          </Text>

          {/* Floating POI dots */}
          <View style={styles.dotsOverlay}>
            {filteredPOIs.map((poi, i) => {
              const config = CATEGORY_CONFIG[poi.category];
              return (
                <Animated.View
                  key={poi.id}
                  entering={FadeInDown.delay(i * 80).springify()}
                  style={[
                    styles.mapDot,
                    {
                      backgroundColor: config.color,
                      left: `${15 + ((i * 37) % 70)}%`,
                      top: `${20 + ((i * 23) % 50)}%`,
                    },
                  ]}
                >
                  <Ionicons name={config.icon as any} size={10} color="#fff" />
                </Animated.View>
              );
            })}
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
        contentContainerStyle={styles.chipsContent}
      >
        <Pressable
          onPress={() => setActiveCategory("ALL")}
          style={[
            styles.chip,
            activeCategory === "ALL" && styles.chipActive,
          ]}
        >
          <Ionicons
            name="grid"
            size={14}
            color={activeCategory === "ALL" ? "#fff" : DS.textSecondary}
          />
          <Text
            style={[
              styles.chipLabel,
              activeCategory === "ALL" && styles.chipLabelActive,
            ]}
          >
            Todo
          </Text>
        </Pressable>

        {(Object.entries(CATEGORY_CONFIG) as [CulturalCategory, typeof CATEGORY_CONFIG[CulturalCategory]][]).map(
          ([key, config]) => (
            <Pressable
              key={key}
              onPress={() => setActiveCategory(key)}
              style={[
                styles.chip,
                activeCategory === key && {
                  ...styles.chipActive,
                  backgroundColor: config.color + "20",
                  borderColor: config.color,
                },
              ]}
            >
              <Ionicons
                name={config.icon as any}
                size={14}
                color={activeCategory === key ? config.color : DS.textSecondary}
              />
              <Text
                style={[
                  styles.chipLabel,
                  activeCategory === key && { color: config.color },
                ]}
              >
                {config.label}
              </Text>
            </Pressable>
          )
        )}
      </ScrollView>

      {/* POI List */}
      <FlatList
        data={filteredPOIs}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const config = CATEGORY_CONFIG[item.category];
          return (
            <Animated.View entering={FadeInRight.delay(index * 70).springify()}>
              <Pressable
                style={styles.poiCard}
                onPress={() => setSelectedPOI(item)}
              >
                <Image source={{ uri: item.imageUrl }} style={styles.poiImage} />
                <View style={styles.poiContent}>
                  <View style={styles.poiTopRow}>
                    <View
                      style={[
                        styles.categoryBadge,
                        { backgroundColor: config.color + "20" },
                      ]}
                    >
                      <Ionicons
                        name={config.icon as any}
                        size={10}
                        color={config.color}
                      />
                      <Text style={[styles.categoryText, { color: config.color }]}>
                        {config.label}
                      </Text>
                    </View>
                    <Text style={styles.distance}>{item.distance}</Text>
                  </View>

                  <Text style={styles.poiName}>{item.name}</Text>
                  <Text style={styles.poiDesc} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View style={styles.poiBottomRow}>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text style={styles.ratingText}>{item.rating}</Text>
                      <Text style={styles.reviewCount}>
                        ({item.reviewCount})
                      </Text>
                    </View>
                    <View style={styles.tagsRow}>
                      {item.tags.map((tag) => (
                        <View key={tag} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                {item.isFavorite && (
                  <View style={styles.favBadge}>
                    <Ionicons name="heart" size={12} color="#FC8181" />
                  </View>
                )}
              </Pressable>
            </Animated.View>
          );
        }}
      />
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
    paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
  headerSubtitle: { color: DS.textSecondary, fontSize: 12, marginTop: 2 },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Map card
  mapCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    height: 180,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  mapInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mapPlaceholder: { color: DS.textSecondary, fontSize: 16, marginTop: 8 },
  mapSubtext: { color: DS.textMuted, fontSize: 11, marginTop: 4 },
  dotsOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  mapDot: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },

  // Chips
  chipsRow: { marginTop: 16, maxHeight: 44 },
  chipsContent: { paddingHorizontal: 16, gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.04)",
    gap: 6,
  },
  chipActive: {
    backgroundColor: "rgba(255,215,0,0.15)",
    borderColor: DS.primary,
  },
  chipLabel: { color: DS.textSecondary, fontSize: 12, fontWeight: "600" },
  chipLabelActive: { color: DS.primary },

  // List
  listContent: { padding: 16, paddingBottom: 100, gap: 12 },

  poiCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  poiImage: { width: 100, height: 120 },
  poiContent: { flex: 1, padding: 12, gap: 4 },
  poiTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  categoryText: { fontSize: 10, fontWeight: "600" },
  distance: { color: DS.textMuted, fontSize: 11 },
  poiName: { color: "#fff", fontSize: 15, fontWeight: "700" },
  poiDesc: { color: DS.textSecondary, fontSize: 11, lineHeight: 15 },
  poiBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { color: "#FFD700", fontSize: 12, fontWeight: "700" },
  reviewCount: { color: DS.textMuted, fontSize: 10 },
  tagsRow: { flexDirection: "row", gap: 4 },
  tag: {
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: { color: DS.textSecondary, fontSize: 9, fontWeight: "600" },

  favBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
