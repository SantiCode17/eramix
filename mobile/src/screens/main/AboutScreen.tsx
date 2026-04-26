import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { GlassCard } from "@/design-system";
import { colors, typography, spacing, radii, DS } from "@/design-system/tokens";

const APP_VERSION = "1.0.0";

interface InfoRowProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  delay: number;
  onPress?: () => void;
}

function InfoRow({ icon, label, value, delay, onPress }: InfoRowProps) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <Pressable
        onPress={() => {
          if (onPress) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress();
          }
        }}
        disabled={!onPress}
        style={({ pressed }) => [
          styles.infoRow,
          pressed && onPress && styles.infoRowPressed,
        ]}
      >
        <Ionicons name={icon} size={20} color={colors.eu.star} />
        <View style={styles.infoTexts}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={[styles.infoValue, onPress && styles.infoLink]}>
            {value}
          </Text>
        </View>
        {onPress && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.text.tertiary}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function AboutScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[DS.background, "#0E1A35", "#0F1535"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo & Title */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[colors.eu.star, colors.eu.orange]}
              style={styles.logoGradient}
            >
              <Ionicons name="earth" size={44} color={colors.text.inverse} />
            </LinearGradient>
          </View>
          <Text style={styles.appName}>EraMix</Text>
          <Text style={styles.tagline}>Tu comunidad Erasmus en Europa</Text>
          <Text style={styles.version}>Versión {APP_VERSION}</Text>
        </Animated.View>

        {/* About Section */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <GlassCard style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              EraMix conecta a estudiantes Erasmus de toda Europa. Descubre
              compañeros, eventos, intercambios de idiomas, alojamiento y mucho
              más — todo en una app diseñada para tu aventura europea.
            </Text>
          </GlassCard>
        </Animated.View>

        {/* Info Rows */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>

          <InfoRow
            icon="code-slash-outline"
            label="Desarrollado por"
            value="Equipo EraMix"
            delay={300}
          />
          <InfoRow
            icon="globe-outline"
            label="Web"
            value="eramix.eu"
            delay={350}
            onPress={() => Linking.openURL("https://eramix.eu")}
          />
          <InfoRow
            icon="mail-outline"
            label="Contacto"
            value="hello@eramix.eu"
            delay={400}
            onPress={() => Linking.openURL("mailto:hello@eramix.eu")}
          />
          <InfoRow
            icon="logo-github"
            label="GitHub"
            value="github.com/SantiCode17/eramix"
            delay={450}
            onPress={() =>
              Linking.openURL("https://github.com/SantiCode17/eramix")
            }
          />
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>

          <InfoRow
            icon="document-text-outline"
            label="Términos de servicio"
            value="Ver términos"
            delay={500}
            onPress={() => Linking.openURL("https://eramix.eu/terms")}
          />
          <InfoRow
            icon="shield-checkmark-outline"
            label="Política de privacidad"
            value="Ver política"
            delay={550}
            onPress={() => Linking.openURL("https://eramix.eu/privacy")}
          />
          <InfoRow
            icon="document-outline"
            label="Licencias open source"
            value="Ver licencias"
            delay={600}
            onPress={() => Linking.openURL("https://eramix.eu/licenses")}
          />
        </View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(650).springify()}>
          <GlassCard style={styles.statsCard}>
            <Text style={styles.statsTitle}>EraMix en números</Text>
            <View style={styles.statsGrid}>
              {[
                { num: "64", label: "Pantallas" },
                { num: "22", label: "Componentes" },
                { num: "19", label: "Navegadores" },
                { num: "12+", label: "Animaciones" },
              ].map((stat) => (
                <View key={stat.label} style={styles.statItem}>
                  <Text style={styles.statNumber}>{stat.num}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Footer */}
        <Animated.View entering={FadeInDown.delay(700).springify()}>
          <Text style={styles.footer}>
            Hecho con cariño para la comunidad Erasmus
          </Text>
          <Text style={styles.copyright}>
            © {new Date().getFullYear()} EraMix. Todos los derechos reservados.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg },
  header: { alignItems: "center", marginBottom: spacing.xl },
  logoContainer: { marginBottom: spacing.md },
  logoGradient: {
    width: 88,
    height: 88,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.hero.fontSize,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  version: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
  },
  aboutCard: { padding: spacing.lg, marginBottom: spacing.xl },
  aboutText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    lineHeight: typography.sizes.body.lineHeight,
    color: colors.text.secondary,
    textAlign: "center",
  },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  infoRowPressed: { opacity: 0.6 },
  infoTexts: { flex: 1, marginLeft: spacing.md },
  infoLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.primary,
  },
  infoValue: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    marginTop: 2,
  },
  infoLink: { color: colors.text.link },
  statsCard: { padding: spacing.lg, marginBottom: spacing.xl },
  statsTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h4.fontSize,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  statsGrid: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center" },
  statNumber: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h2.fontSize,
    color: colors.eu.star,
  },
  statLabel: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.tiny.fontSize,
    color: colors.text.secondary,
    marginTop: 2,
  },
  footer: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.tertiary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  copyright: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.tiny.fontSize,
    color: colors.text.disabled,
    textAlign: "center",
  },
});
