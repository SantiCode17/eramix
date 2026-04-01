import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  colors,
  typography,
  spacing,
  GlassCard,
  GlassButton,
  GlassInput,
  GlassModal,
  Avatar,
  Badge,
  Chip,
  Tag,
  Divider,
  LoadingSpinner,
  EmptyState,
  ErrorState,
  Header,
} from "@/design-system";

export default function ComponentGallery(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [chipSelected, setChipSelected] = useState(false);

  return (
    <LinearGradient
      colors={[colors.background.start, colors.background.end]}
      style={styles.gradient}
    >
      <Header title="Component Gallery" variant="glass" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION: GlassCard */}
        <Text style={styles.sectionTitle}>GlassCard</Text>
        <GlassCard variant="surface">
          <Text style={styles.cardText}>Surface variant</Text>
        </GlassCard>
        <GlassCard variant="elevated">
          <Text style={styles.cardText}>Elevated variant</Text>
        </GlassCard>
        <GlassCard variant="prominent">
          <Text style={styles.cardText}>Prominent variant</Text>
        </GlassCard>

        <Divider />

        {/* SECTION: GlassButton */}
        <Text style={styles.sectionTitle}>GlassButton</Text>
        <GlassButton title="Primary" variant="primary" onPress={() => {}} />
        <View style={styles.spacer} />
        <GlassButton title="Secondary" variant="secondary" onPress={() => {}} />
        <View style={styles.spacer} />
        <GlassButton title="Ghost" variant="ghost" onPress={() => {}} />
        <View style={styles.spacer} />
        <GlassButton title="Loading..." variant="primary" loading onPress={() => {}} />
        <View style={styles.spacer} />
        <GlassButton title="Disabled" variant="primary" disabled onPress={() => {}} />

        <Divider />

        {/* SECTION: GlassInput */}
        <Text style={styles.sectionTitle}>GlassInput</Text>
        <GlassInput label="Nombre" value={inputValue} onChangeText={setInputValue} />
        <View style={styles.spacer} />
        <GlassInput label="Error" value="" onChangeText={() => {}} error="Campo obligatorio" />
        <View style={styles.spacer} />
        <GlassInput label="Correcto" value="santiago@mail.com" onChangeText={() => {}} success />

        <Divider />

        {/* SECTION: GlassModal */}
        <Text style={styles.sectionTitle}>GlassModal</Text>
        <GlassButton
          title="Abrir Modal"
          variant="secondary"
          onPress={() => setModalVisible(true)}
        />
        <GlassModal visible={modalVisible} onClose={() => setModalVisible(false)}>
          <Text style={styles.cardText}>Contenido del Modal</Text>
          <View style={styles.spacer} />
          <GlassButton
            title="Cerrar"
            variant="primary"
            onPress={() => setModalVisible(false)}
          />
        </GlassModal>

        <Divider />

        {/* SECTION: Avatar */}
        <Text style={styles.sectionTitle}>Avatar</Text>
        <View style={styles.row}>
          <Avatar name="Santiago López" size="sm" online />
          <Avatar name="María García" size="md" online={false} />
          <Avatar name="Alex" size="lg" />
        </View>

        <Divider />

        {/* SECTION: Badge */}
        <Text style={styles.sectionTitle}>Badge</Text>
        <View style={styles.row}>
          <Badge count={3} variant="primary" />
          <Badge count={12} variant="secondary" />
          <Badge count={150} variant="error" />
          <Badge dot variant="error" />
        </View>

        <Divider />

        {/* SECTION: Chip */}
        <Text style={styles.sectionTitle}>Chip</Text>
        <View style={styles.row}>
          <Chip
            label="Seleccionable"
            selected={chipSelected}
            onPress={() => setChipSelected(!chipSelected)}
          />
          <Chip label="Con cierre" onRemove={() => {}} />
          <Chip label="Disabled" disabled />
        </View>

        <Divider />

        {/* SECTION: Tag */}
        <Text style={styles.sectionTitle}>Tag</Text>
        <View style={styles.row}>
          <Tag label="Erasmus+" />
          <Tag label="España" color={colors.status.success} />
          <Tag label="Urgente" color={colors.status.error} />
        </View>

        <Divider />

        {/* SECTION: LoadingSpinner */}
        <Text style={styles.sectionTitle}>LoadingSpinner</Text>
        <LoadingSpinner />

        <Divider />

        {/* SECTION: EmptyState */}
        <Text style={styles.sectionTitle}>EmptyState</Text>
        <GlassCard variant="surface">
          <EmptyState
            iconName="home-outline"
            title="Sin publicaciones"
            message="Aún no hay publicaciones de vivienda disponibles."
            action={
              <GlassButton title="Publicar" variant="primary" size="sm" onPress={() => {}} />
            }
          />
        </GlassCard>

        <Divider />

        {/* SECTION: ErrorState */}
        <Text style={styles.sectionTitle}>ErrorState</Text>
        <GlassCard variant="surface">
          <ErrorState
            action={
              <GlassButton title="Reintentar" variant="secondary" size="sm" onPress={() => {}} />
            }
          />
        </GlassCard>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  sectionTitle: {
    color: colors.eu.star,
    fontSize: typography.sizes.h3.fontSize,
    fontFamily: typography.families.heading,
    fontWeight: "700",
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  cardText: {
    color: colors.text.primary,
    fontSize: typography.sizes.body.fontSize,
    fontFamily: typography.families.body,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    alignItems: "center",
  },
  spacer: {
    height: spacing.sm,
  },
});
