import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SectionList,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Linking,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { ScreenBackground, EmptyState } from "@/design-system/components";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import { placesApi, type UserPlace, type CreateUserPlaceRequest } from "@/api/placesService";

type IoniconsName = keyof typeof Ionicons.glyphMap;

const CATEGORIES: { key: string; label: string; icon: IoniconsName; color: string }[] = [
  { key: "MONUMENT", label: "Monumento", icon: "business", color: "#FFD700" },
  { key: "FOOD", label: "Gastronomia", icon: "restaurant", color: "#FF6B2B" },
  { key: "NATURE", label: "Naturaleza", icon: "leaf", color: "#00D4AA" },
  { key: "CULTURE", label: "Cultura", icon: "color-palette", color: "#6C5CE7" },
  { key: "NIGHTLIFE", label: "Vida nocturna", icon: "moon", color: "#FF4F6F" },
  { key: "SHOPPING", label: "Compras", icon: "bag-handle", color: "#00B4D8" },
  { key: "SPORT", label: "Deporte", icon: "bicycle", color: "#38A169" },
  { key: "OTHER", label: "Otro", icon: "location", color: "#8FA3BC" },
];
const CAT_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));

const PRIORITIES: { key: string; label: string; color: string; icon: IoniconsName }[] = [
  { key: "LOW", label: "Baja", color: "#00D4AA", icon: "arrow-down" },
  { key: "MEDIUM", label: "Media", color: "#FFD700", icon: "remove" },
  { key: "HIGH", label: "Alta", color: "#FF4F6F", icon: "arrow-up" },
];

export default function PlacesToVisitScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "visited">("all");

  const [showModal, setShowModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState<UserPlace | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCat, setFormCat] = useState("OTHER");
  const [formPriority, setFormPriority] = useState("MEDIUM");
  const [formMapsUrl, setFormMapsUrl] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const [detailPlace, setDetailPlace] = useState<UserPlace | null>(null);

  const { data: places = [], isLoading, refetch } = useQuery({
    queryKey: ["userPlaces"],
    queryFn: placesApi.getPlaces,
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: (body: CreateUserPlaceRequest) => placesApi.createPlace(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPlaces"] });
      resetForm();
      Alert.alert("Lugar creado", "Tu nuevo lugar ha sido guardado.");
    },
    onError: () => Alert.alert("Error", "No se pudo crear el lugar."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => placesApi.updatePlace(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPlaces"] });
    },
    onError: () => Alert.alert("Error", "No se pudo actualizar el lugar."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => placesApi.deletePlace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPlaces"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => Alert.alert("Error", "No se pudo eliminar el lugar."),
  });

  const resetForm = useCallback(() => {
    setFormName("");
    setFormDesc("");
    setFormCat("OTHER");
    setFormPriority("MEDIUM");
    setFormMapsUrl("");
    setFormNotes("");
    setEditingPlace(null);
    setShowModal(false);
  }, []);

  const openAdd = () => { resetForm(); setShowModal(true); };

  const openEdit = (p: UserPlace) => {
    setEditingPlace(p);
    setFormName(p.name);
    setFormDesc(p.description ?? "");
    setFormCat(p.category);
    setFormPriority(p.priority);
    setFormMapsUrl(p.mapsUrl ?? "");
    setFormNotes(p.notes ?? "");
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formName.trim()) { Alert.alert("Error", "El nombre es obligatorio"); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const payload = {
      name: formName.trim(),
      description: formDesc.trim() || undefined,
      category: formCat,
      priority: formPriority,
      mapsUrl: formMapsUrl.trim() || undefined,
      notes: formNotes.trim() || undefined,
    };
    if (editingPlace) {
      updateMutation.mutate({ id: editingPlace.id, body: payload });
      resetForm();
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleToggleVisited = (p: UserPlace) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateMutation.mutate({ id: p.id, body: { visited: !p.visited } });
  };

  const handleDelete = (p: UserPlace) => {
    Alert.alert("Eliminar lugar", "Eliminar \"" + p.name + "\"?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => deleteMutation.mutate(p.id) },
    ]);
  };

  const handleRefresh = async () => { setRefreshing(true); await refetch(); setRefreshing(false); };

  const filtered = useMemo(() => {
    let list = places;
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (filterCat) list = list.filter((p) => p.category === filterCat);
    if (filterStatus === "pending") list = list.filter((p) => !p.visited);
    if (filterStatus === "visited") list = list.filter((p) => p.visited);
    return list;
  }, [places, search, filterCat, filterStatus]);

  const pendingList = filtered.filter((p) => !p.visited);
  const visitedList = filtered.filter((p) => p.visited);
  const stats = { total: places.length, visited: places.filter((p) => p.visited).length, pending: places.filter((p) => !p.visited).length };

  const sections = [
    ...(pendingList.length > 0 ? [{ title: "Pendientes (" + pendingList.length + ")", data: pendingList }] : []),
    ...(visitedList.length > 0 ? [{ title: "Visitados (" + visitedList.length + ")", data: visitedList }] : []),
  ];

  const catInfo = (key: string) => CAT_MAP[key] ?? CAT_MAP["OTHER"];
  const prioInfo = (key: string) => PRIORITIES.find((p) => p.key === key) ?? PRIORITIES[1];

  const renderCard = ({ item, index }: { item: UserPlace; index: number }) => {
    const cat = catInfo(item.category);
    const prio = prioInfo(item.priority);
    return (
      <Animated.View entering={FadeInDown.delay(index * 40)} style={st.card}>
        <Pressable style={st.cardInner} onPress={() => setDetailPlace(item)}>
          <Pressable onPress={() => handleToggleVisited(item)} style={[st.checkbox, item.visited && st.checkboxDone]}>
            {item.visited && <Ionicons name="checkmark" size={16} color={colors.eu.deep} />}
          </Pressable>
          <View style={st.cardBody}>
            <Text style={[st.cardName, item.visited && st.cardNameDone]} numberOfLines={1}>{item.name}</Text>
            {item.description ? <Text style={st.cardDesc} numberOfLines={1}>{item.description}</Text> : null}
            <View style={st.cardTags}>
              <View style={[st.tagChip, { backgroundColor: cat.color + "18" }]}>
                <Ionicons name={cat.icon} size={12} color={cat.color} />
                <Text style={[st.tagText, { color: cat.color }]}>{cat.label}</Text>
              </View>
              <View style={[st.tagChip, { backgroundColor: prio.color + "18" }]}>
                <Ionicons name={prio.icon} size={12} color={prio.color} />
                <Text style={[st.tagText, { color: prio.color }]}>{prio.label}</Text>
              </View>
            </View>
          </View>
          <View style={st.cardActions}>
            {item.mapsUrl ? (
              <Pressable onPress={() => Linking.openURL(item.mapsUrl!)} hitSlop={8}>
                <Ionicons name="map-outline" size={18} color={colors.eu.star} />
              </Pressable>
            ) : null}
            <Pressable onPress={() => openEdit(item)} hitSlop={8}>
              <Ionicons name="create-outline" size={18} color={colors.text.secondary} />
            </Pressable>
            <Pressable onPress={() => handleDelete(item)} hitSlop={8}>
              <Ionicons name="trash-outline" size={16} color={colors.status.error} />
            </Pressable>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <ScreenBackground>
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <View style={st.header}>
          <Pressable onPress={() => navigation.goBack()} style={st.headerBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
          </Pressable>
          <Text style={st.title}>Mis Lugares</Text>
          <Pressable onPress={openAdd} style={st.headerBtn}>
            <Ionicons name="add" size={22} color={colors.text.primary} />
          </Pressable>
        </View>

        {places.length > 0 && (
          <View style={st.statsRow}>
            <View style={st.statBox}><Text style={st.statNum}>{stats.total}</Text><Text style={st.statLabel}>Total</Text></View>
            <View style={st.statBox}><Text style={[st.statNum, { color: "#00D4AA" }]}>{stats.visited}</Text><Text style={st.statLabel}>Visitados</Text></View>
            <View style={st.statBox}><Text style={[st.statNum, { color: colors.eu.star }]}>{stats.pending}</Text><Text style={st.statLabel}>Pendientes</Text></View>
          </View>
        )}

        <View style={st.searchRow}>
          <View style={st.searchBox}>
            <Ionicons name="search" size={18} color={colors.text.tertiary} />
            <TextInput style={st.searchInput} placeholder="Buscar lugar..." placeholderTextColor={colors.text.tertiary} value={search} onChangeText={setSearch} />
            {search ? <Pressable onPress={() => setSearch("")}><Ionicons name="close-circle" size={18} color={colors.text.tertiary} /></Pressable> : null}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.filterRow} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.xs }}>
          {(["all", "pending", "visited"] as const).map((s) => {
            const active = filterStatus === s;
            const lb: Record<string, string> = { all: "Todos", pending: "Pendientes", visited: "Visitados" };
            return (<Pressable key={s} onPress={() => setFilterStatus(s)} style={[st.filterChip, active && st.filterChipActive]}><Text style={[st.filterChipText, active && st.filterChipTextActive]}>{lb[s]}</Text></Pressable>);
          })}
          <View style={st.filterDivider} />
          {CATEGORIES.map((cat) => {
            const active = filterCat === cat.key;
            return (<Pressable key={cat.key} onPress={() => setFilterCat(active ? null : cat.key)} style={[st.filterChip, active && { backgroundColor: cat.color + "20", borderColor: cat.color + "40" }]}><Ionicons name={cat.icon} size={14} color={active ? cat.color : colors.text.secondary} /><Text style={[st.filterChipText, active && { color: cat.color }]}>{cat.label}</Text></Pressable>);
          })}
        </ScrollView>

        {isLoading ? (
          <View style={st.center}><Text style={{ color: colors.text.secondary }}>Cargando lugares...</Text></View>
        ) : places.length === 0 ? (
          <EmptyState icon="location-outline" title="Sin lugares guardados" message="Pulsa + para guardar los lugares que quieras visitar" />
        ) : filtered.length === 0 ? (
          <View style={st.center}><Ionicons name="search-outline" size={40} color={colors.text.tertiary} /><Text style={{ color: colors.text.secondary, marginTop: spacing.md }}>Sin resultados</Text></View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderCard}
            renderSectionHeader={({ section }) => <Text style={st.sectionTitle}>{section.title}</Text>}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.eu.star} />}
            stickySectionHeadersEnabled={false}
          />
        )}

        <Modal visible={showModal} transparent animationType="slide" onRequestClose={resetForm}>
          <BlurView intensity={90} style={st.modalBlur}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
              <View style={[st.modalContent, { paddingTop: insets.top + spacing.lg }]}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={st.modalHeader}>
                    <Pressable onPress={resetForm} hitSlop={8}><Ionicons name="close" size={24} color={colors.text.primary} /></Pressable>
                    <Text style={st.modalTitle}>{editingPlace ? "Editar Lugar" : "Nuevo Lugar"}</Text>
                    <View style={{ width: 24 }} />
                  </View>
                  <View style={st.formSection}>
                    <Text style={st.formLabel}>Nombre *</Text>
                    <TextInput style={st.input} placeholder="Ej: Torre Eiffel" placeholderTextColor={colors.text.tertiary} value={formName} onChangeText={setFormName} />
                  </View>
                  <View style={st.formSection}>
                    <Text style={st.formLabel}>Descripcion</Text>
                    <TextInput style={[st.input, { minHeight: 60, textAlignVertical: "top" }]} placeholder="Que quieres hacer alli?" placeholderTextColor={colors.text.tertiary} value={formDesc} onChangeText={setFormDesc} multiline />
                  </View>
                  <View style={st.formSection}>
                    <Text style={st.formLabel}>Categoria</Text>
                    <View style={st.chipGrid}>
                      {CATEGORIES.map((c) => {
                        const active = formCat === c.key;
                        return (<Pressable key={c.key} onPress={() => setFormCat(c.key)} style={[st.catChip, active && { backgroundColor: c.color + "25", borderColor: c.color }]}><Ionicons name={c.icon} size={16} color={active ? c.color : colors.text.secondary} /><Text style={[st.catChipText, active && { color: c.color }]}>{c.label}</Text></Pressable>);
                      })}
                    </View>
                  </View>
                  <View style={st.formSection}>
                    <Text style={st.formLabel}>Prioridad</Text>
                    <View style={st.prioRow}>
                      {PRIORITIES.map((p) => {
                        const active = formPriority === p.key;
                        return (<Pressable key={p.key} onPress={() => setFormPriority(p.key)} style={[st.prioChip, active && { backgroundColor: p.color + "25", borderColor: p.color }]}><Ionicons name={p.icon} size={16} color={active ? p.color : colors.text.secondary} /><Text style={[st.prioChipText, active && { color: p.color }]}>{p.label}</Text></Pressable>);
                      })}
                    </View>
                  </View>
                  <View style={st.formSection}>
                    <Text style={st.formLabel}>Enlace Google Maps (opcional)</Text>
                    <TextInput style={st.input} placeholder="https://maps.google.com/..." placeholderTextColor={colors.text.tertiary} value={formMapsUrl} onChangeText={setFormMapsUrl} autoCapitalize="none" keyboardType="url" />
                  </View>
                  <View style={st.formSection}>
                    <Text style={st.formLabel}>Notas (opcional)</Text>
                    <TextInput style={[st.input, { minHeight: 60, textAlignVertical: "top" }]} placeholder="Consejos, horarios, etc." placeholderTextColor={colors.text.tertiary} value={formNotes} onChangeText={setFormNotes} multiline />
                  </View>
                  <Pressable onPress={handleSave} disabled={createMutation.isPending || updateMutation.isPending} style={[st.submitButton, !formName.trim() && { opacity: 0.4 }]}>
                    <LinearGradient colors={[colors.eu.star, "#E6C200"]} style={st.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <Ionicons name={editingPlace ? "save" : "add-circle"} size={20} color={colors.eu.deep} />
                      <Text style={st.submitText}>{editingPlace ? "Guardar cambios" : "Crear lugar"}</Text>
                    </LinearGradient>
                  </Pressable>
                  <View style={{ height: insets.bottom + spacing.xl }} />
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </BlurView>
        </Modal>

        {detailPlace && (
          <Modal visible={!!detailPlace} transparent animationType="fade" onRequestClose={() => setDetailPlace(null)}>
            <Pressable style={st.detailOverlay} onPress={() => setDetailPlace(null)}>
              <Pressable style={st.detailContent} onPress={() => {}}>
                <View style={st.detailHeader}>
                  <View style={[st.detailCatIcon, { backgroundColor: catInfo(detailPlace.category).color + "20" }]}>
                    <Ionicons name={catInfo(detailPlace.category).icon} size={28} color={catInfo(detailPlace.category).color} />
                  </View>
                  <Pressable onPress={() => setDetailPlace(null)}><Ionicons name="close-circle" size={28} color={colors.text.tertiary} /></Pressable>
                </View>
                <Text style={st.detailName}>{detailPlace.name}</Text>
                {detailPlace.description ? <Text style={st.detailDesc}>{detailPlace.description}</Text> : null}
                <View style={st.detailMeta}>
                  <View style={[st.tagChip, { backgroundColor: catInfo(detailPlace.category).color + "18" }]}>
                    <Ionicons name={catInfo(detailPlace.category).icon} size={14} color={catInfo(detailPlace.category).color} />
                    <Text style={[st.tagText, { color: catInfo(detailPlace.category).color }]}>{catInfo(detailPlace.category).label}</Text>
                  </View>
                  <View style={[st.tagChip, { backgroundColor: prioInfo(detailPlace.priority).color + "18" }]}>
                    <Text style={[st.tagText, { color: prioInfo(detailPlace.priority).color }]}>Prioridad: {prioInfo(detailPlace.priority).label}</Text>
                  </View>
                  <View style={[st.tagChip, { backgroundColor: detailPlace.visited ? "#00D4AA18" : colors.eu.star + "18" }]}>
                    <Ionicons name={detailPlace.visited ? "checkmark-circle" : "time-outline"} size={14} color={detailPlace.visited ? "#00D4AA" : colors.eu.star} />
                    <Text style={[st.tagText, { color: detailPlace.visited ? "#00D4AA" : colors.eu.star }]}>{detailPlace.visited ? "Visitado" : "Pendiente"}</Text>
                  </View>
                </View>
                {detailPlace.notes ? (
                  <View style={st.detailNotesBox}>
                    <Text style={st.detailNotesLabel}>Notas</Text>
                    <Text style={st.detailNotesText}>{detailPlace.notes}</Text>
                  </View>
                ) : null}
                <View style={st.detailActions}>
                  {detailPlace.mapsUrl ? (
                    <Pressable onPress={() => Linking.openURL(detailPlace.mapsUrl!)} style={[st.detailActionBtn, { borderColor: colors.eu.star + "30" }]}>
                      <Ionicons name="navigate" size={18} color={colors.eu.star} />
                      <Text style={[st.detailActionText, { color: colors.eu.star }]}>Abrir mapa</Text>
                    </Pressable>
                  ) : null}
                  <Pressable onPress={() => { setDetailPlace(null); openEdit(detailPlace); }} style={[st.detailActionBtn, { borderColor: "rgba(255,255,255,0.12)" }]}>
                    <Ionicons name="create-outline" size={18} color={colors.text.primary} />
                    <Text style={st.detailActionText}>Editar</Text>
                  </Pressable>
                  <Pressable onPress={() => { setDetailPlace(null); handleDelete(detailPlace); }} style={[st.detailActionBtn, { borderColor: "rgba(255,79,111,0.20)" }]}>
                    <Ionicons name="trash-outline" size={18} color={colors.status.error} />
                    <Text style={[st.detailActionText, { color: colors.status.error }]}>Eliminar</Text>
                  </Pressable>
                </View>
              </Pressable>
            </Pressable>
          </Modal>
        )}
      </View>
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: spacing.sm },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  headerBtn: { width: 40, height: 40, borderRadius: radii.md, backgroundColor: colors.glass.white, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: typography.families.heading, fontSize: typography.sizes.h2.fontSize, color: colors.text.primary },
  statsRow: { flexDirection: "row", paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.md },
  statBox: { flex: 1, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: radii.lg, padding: spacing.md, alignItems: "center", borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,255,255,0.08)" },
  statNum: { fontFamily: typography.families.heading, fontSize: 20, color: colors.text.primary },
  statLabel: { fontFamily: typography.families.body, fontSize: 11, color: colors.text.tertiary, marginTop: 2 },
  searchRow: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: radii.lg, paddingHorizontal: spacing.md, gap: spacing.sm, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  searchInput: { flex: 1, paddingVertical: 10, fontFamily: typography.families.body, fontSize: 14, color: colors.text.primary },
  filterRow: { marginBottom: spacing.md, maxHeight: 40 },
  filterChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radii.full, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  filterChipActive: { backgroundColor: "rgba(255,215,0,0.10)", borderColor: "rgba(255,215,0,0.25)" },
  filterChipText: { fontFamily: typography.families.body, fontSize: 12, color: colors.text.secondary },
  filterChipTextActive: { color: colors.eu.star, fontFamily: typography.families.bodyMedium },
  filterDivider: { width: 1, height: 20, backgroundColor: "rgba(255,255,255,0.10)", alignSelf: "center" },
  sectionTitle: { fontFamily: typography.families.subheading, fontSize: 15, color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm },
  card: { marginBottom: spacing.sm, borderRadius: radii.lg, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", overflow: "hidden" },
  cardInner: { flexDirection: "row", alignItems: "center", padding: spacing.md, gap: spacing.md },
  checkbox: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: "rgba(255,255,255,0.20)", alignItems: "center", justifyContent: "center" },
  checkboxDone: { backgroundColor: colors.eu.star, borderColor: colors.eu.star },
  cardBody: { flex: 1 },
  cardName: { fontFamily: typography.families.bodyMedium, fontSize: 15, color: colors.text.primary },
  cardNameDone: { textDecorationLine: "line-through", color: colors.text.tertiary },
  cardDesc: { fontFamily: typography.families.body, fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  cardTags: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.xs, flexWrap: "wrap" },
  tagChip: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.full },
  tagText: { fontFamily: typography.families.body, fontSize: 10 },
  cardActions: { gap: spacing.sm, alignItems: "center" },
  modalBlur: { flex: 1 },
  modalContent: { flex: 1, paddingHorizontal: spacing.lg },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
  modalTitle: { fontFamily: typography.families.heading, fontSize: typography.sizes.h2.fontSize, color: colors.text.primary },
  formSection: { marginBottom: spacing.lg },
  formLabel: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.text.secondary, marginBottom: spacing.sm },
  input: { backgroundColor: colors.glass.white, borderRadius: radii.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontFamily: typography.families.body, fontSize: 14, color: colors.text.primary },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  catChip: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.full, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1.5, borderColor: "transparent" },
  catChipText: { fontFamily: typography.families.body, fontSize: 13, color: colors.text.secondary },
  prioRow: { flexDirection: "row", gap: spacing.sm },
  prioChip: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, paddingVertical: spacing.sm, borderRadius: radii.lg, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1.5, borderColor: "transparent" },
  prioChipText: { fontFamily: typography.families.body, fontSize: 13, color: colors.text.secondary },
  submitButton: { borderRadius: radii.lg, overflow: "hidden", marginBottom: spacing.lg },
  submitGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, gap: spacing.sm },
  submitText: { fontFamily: typography.families.subheading, fontSize: 16, color: colors.eu.deep },
  detailOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  detailContent: { backgroundColor: "#0D1B2A", borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.xl, paddingBottom: 40, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  detailHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
  detailCatIcon: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  detailName: { fontFamily: typography.families.heading, fontSize: 22, color: colors.text.primary, marginBottom: spacing.sm },
  detailDesc: { fontFamily: typography.families.body, fontSize: 15, color: colors.text.secondary, lineHeight: 22, marginBottom: spacing.md },
  detailMeta: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  detailNotesBox: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,255,255,0.08)" },
  detailNotesLabel: { fontFamily: typography.families.bodyMedium, fontSize: 12, color: colors.text.tertiary, marginBottom: spacing.xs },
  detailNotesText: { fontFamily: typography.families.body, fontSize: 14, color: colors.text.secondary, lineHeight: 20 },
  detailActions: { gap: spacing.sm },
  detailActionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingVertical: 13, borderRadius: radii.lg, borderWidth: 1 },
  detailActionText: { fontFamily: typography.families.bodyMedium, fontSize: 15, color: colors.text.primary },
});
