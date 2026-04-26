/**
 * ────────────────────────────────────────────────────────
 *  EmergencyContactsScreen — Contactos de emergencia
 * ────────────────────────────────────────────────────────
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  colors,
  typography,
  spacing,
  radii,
  DS,
} from "@/design-system/tokens";
import { wellbeingApi } from "@/api/wellbeingService";
import type { EmergencyContact } from "@/types/wellbeing";

export default function EmergencyContactsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("Otro");

  const RELATIONSHIP_OPTIONS = [
    "Madre", "Padre", "Hermano/a", "Amigo/a", "Pareja", "Tutor/a", "Otro",
  ];

  const { data: contacts = [], isLoading } = useQuery<EmergencyContact[]>({
    queryKey: ["emergencyContacts"],
    queryFn: wellbeingApi.getEmergencyContacts,
  });

  const addMutation = useMutation({
    mutationFn: wellbeingApi.addEmergencyContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] });
      setShowForm(false);
      setName("");
      setPhone("");
      setRelationship("Otro");
    },
    onError: () => {
      Alert.alert("Error", "No se pudo guardar el contacto. Inténtalo de nuevo.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: wellbeingApi.deleteEmergencyContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] });
    },
  });

  const handleAdd = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Error", "Nombre y teléfono son obligatorios");
      return;
    }
    addMutation.mutate({
      name: name.trim(),
      phoneNumber: phone.trim(),
      relationship: relationship.trim() || "Otro",
    });
  };

  const handleDelete = (id: number, contactName: string) => {
    Alert.alert("Eliminar contacto", `¿Eliminar a ${contactName}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={[DS.background, "#0E1A35", "#0F1535"]} style={StyleSheet.absoluteFill} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Contactos de emergencia</Text>
          <Pressable onPress={() => setShowForm(!showForm)}>
            <Ionicons name={showForm ? "close" : "add"} size={24} color={colors.eu.star} />
          </Pressable>
        </View>

        {/* Add Form */}
        {showForm && (
          <View style={styles.formCard}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nombre"
              placeholderTextColor={colors.text.tertiary}
            />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Teléfono"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="phone-pad"
            />
            <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 8, fontFamily: typography.families.bodyMedium }}>
              Relación
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => setRelationship(opt)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: relationship === opt ? "#FFD700" : "rgba(255,255,255,0.06)",
                    borderWidth: 1,
                    borderColor: relationship === opt ? "#FFD700" : "rgba(255,255,255,0.12)",
                  }}
                >
                  <Text style={{
                    color: relationship === opt ? "#0d1b4b" : "rgba(255,255,255,0.7)",
                    fontWeight: relationship === opt ? "700" : "400",
                    fontSize: 13,
                  }}>
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={handleAdd} disabled={addMutation.isPending}>
              <LinearGradient
                colors={colors.gradient.primary}
                style={styles.addBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.addBtnText}>
                  {addMutation.isPending ? "Añadiendo..." : "Añadir contacto"}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {/* Contact List */}
        {isLoading ? (
          <ActivityIndicator color={colors.eu.star} size="large" style={{ marginTop: 40 }} />
        ) : contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={56} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>Sin contactos de emergencia</Text>
            <Text style={styles.emptySubtext}>
              Añade personas que serán notificadas en caso de SOS
            </Text>
          </View>
        ) : (
          contacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactAvatar}>
                <Text style={styles.contactInitial}>
                  {contact.name[0]?.toUpperCase()}
                </Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
                <Text style={styles.contactRelation}>{contact.relationship}</Text>
              </View>
              <Pressable onPress={() => handleDelete(contact.id, contact.name)}>
                <Ionicons name="trash-outline" size={20} color={colors.status.error} />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: spacing.lg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  headerTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h4.fontSize,
    color: colors.text.primary,
  },

  // Form
  formCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    padding: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  input: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  addBtn: {
    height: 44,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },

  // Contact Card
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(59, 107, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  contactInitial: {
    fontFamily: typography.families.heading,
    fontSize: 18,
    color: colors.eu.light,
  },
  contactInfo: { flex: 1 },
  contactName: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  contactPhone: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    marginTop: 2,
  },
  contactRelation: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.tiny.fontSize,
    color: colors.text.tertiary,
    marginTop: 2,
  },

  // Empty
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxl * 2,
    gap: spacing.sm,
  },
  emptyText: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h4.fontSize,
    color: colors.text.secondary,
  },
  emptySubtext: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.tertiary,
    textAlign: "center",
    maxWidth: 280,
  },
});
