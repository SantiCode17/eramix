/**
 * ════════════════════════════════════════════════════
 *  HomeScreen — European Glass Dashboard
 *  Glassmorphism hero · Liquid glass cards · Staggered animations
 * ════════════════════════════════════════════════════
 */

import React, { useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import {
  colors,
  palette,
  typography,
  spacing,
  radii,
  shadows,
  animation,
  borders,
  DS,
} from "@/design-system/tokens";
import {
  GlassCard,
  GlassMetricCard,
  SectionHeader,
  QuickActionGrid,
  type QuickAction,
} from "@/design-system";
import { useAuthStore } from "@/store";

const { width: SW, height: SH } = Dimensions.get("window");
const CARD_GAP = spacing.sm;
const METRIC_W = (SW - spacing.lg * 2 - CARD_GAP) / 2;

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// ═══════════════════════════════════════════════════
// Ambient Particle — floating golden dust
// ═══════════════════════════════════════════════════
function AmbientParticle({ delay, x }: { delay: number; x: number }) {
  const ty = useSharedValue(SH + 20);
  const op = useSharedValue(0);

  useEffect(() => {
    const dur = 10000 + Math.random() * 5000;
    ty.value = withRepeat(
      withSequence(
        withTiming(SH + 20, { duration: 0 }),
        withTiming(-20, { duration: dur, easing: Easing.linear }),
      ),
      -1,
    );
    op.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(0.5, { duration: dur * 0.15 }),
        withTiming(0.5, { duration: dur * 0.7 }),
        withTiming(0, { duration: dur * 0.15 }),
      ),
      -1,
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
    opacity: op.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x,
          width: 2 + Math.random() * 2,
          height: 2 + Math.random() * 2,
          borderRadius: 2,
          backgroundColor: colors.eu.star,
        },
        style,
      ]}
    />
  );
}

// ═══════════════════════════════════════════════════
// Feature Card — glass card with gradient icon
// ═══════════════════════════════════════════════════
interface FeatureCard {
  id: string;
  title: string;
  subtitle: string;
  icon: IoniconsName;
  gradient: readonly [string, string, ...string[]];
  glowColor: string;
  route: string;
}

const FEATURES: FeatureCard[] = [
  {
    id: "discover",
    title: "Descubrir",
    subtitle: "Conoce Erasmus cerca",
    icon: "compass",
    gradient: ["#3B6BFF", "#1A3DBA"],
    glowColor: "#3B6BFF",
    route: "HomeTabs",
  },
  {
    id: "finance",
    title: "Finanzas",
    subtitle: "Tu presupuesto",
    icon: "wallet",
    gradient: ["#00D68F", "#00876A"],
    glowColor: "#00D68F",
    route: "Finance",
  },
  {
    id: "ticketing",
    title: "Tickets",
    subtitle: "Eventos seguros",
    icon: "ticket",
    gradient: ["#B47AFF", "#8B5CF6"],
    glowColor: "#8B5CF6",
    route: "Ticketing",
  },
  {
    id: "wellbeing",
    title: "Bienestar",
    subtitle: "Salud mental",
    icon: "heart",
    gradient: ["#FF6B8A", "#D63B5E"],
    glowColor: "#FF4F6F",
    route: "Wellbeing",
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FeatureCardItem({
  card,
  index,
  onPress,
}: {
  card: FeatureCard;
  index: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(300 + index * 70).springify()}>
      <AnimatedPressable
        style={[styles.featureCard, animStyle]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        onPressIn={() => {
          scale.value = withSpring(0.94, animation.spring.snappy);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, animation.spring.bouncy);
        }}
      >
        <LinearGradient
          colors={card.gradient}
          style={styles.featureGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Glass overlay */}
          <View style={styles.featureGlassOverlay} />
          {/* Top highlight refraction */}
          <View style={styles.featureHighlight} />

          <View style={styles.featureIconWrap}>
            <Ionicons name={card.icon} size={24} color="rgba(255,255,255,0.95)" />
          </View>
          <Text style={styles.featureTitle}>{card.title}</Text>
          <Text style={styles.featureSubtitle}>{card.subtitle}</Text>

          {/* Corner accent */}
          <View style={styles.featureCornerDot} />
        </LinearGradient>
      </AnimatedPressable>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════
// Story Ring — online user avatars
// ═══════════════════════════════════════════════════
function StoryRing({ name, color, delay }: { name: string; color: string; delay: number }) {
  return (
    <Animated.View entering={FadeInRight.delay(delay).springify()} style={styles.storyRing}>
      <LinearGradient
        colors={[color, `${color}88`]}
        style={styles.storyGradientRing}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.storyInner}>
          <Text style={styles.storyInitial}>{name[0]}</Text>
        </View>
      </LinearGradient>
      <Text style={styles.storyName}>{name.split(" ")[0]}</Text>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════
// HomeScreen
// ═══════════════════════════════════════════════════
export default function HomeScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 6) return "Buenas noches";
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  // Breathing glow for the hero
  const glowValue = useSharedValue(0);
  useEffect(() => {
    glowValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowValue.value, [0, 1], [0.05, 0.15]),
  }));

  const quickActions: QuickAction[] = useMemo(
    () => [
      {
        id: "events",
        icon: "calendar",
        label: "Eventos",
        color: colors.eu.star,
        onPress: () => navigation.navigate("HomeTabs", { screen: "Events" }),
      },
      {
        id: "chat",
        icon: "chatbubbles",
        label: "Chat",
        color: palette.electricBlue,
        onPress: () => navigation.navigate("HomeTabs", { screen: "Chat" }),
      },
      {
        id: "groups",
        icon: "people",
        label: "Grupos",
        color: palette.emerald,
        onPress: () => navigation.navigate("Groups"),
      },
      {
        id: "notifications",
        icon: "notifications",
        label: "Notificaciones",
        color: palette.coral,
        onPress: () => navigation.navigate("Notifications"),
      },
    ],
    [navigation],
  );

  return (
    <View style={styles.root}>
      {/* ── Deep dark gradient background ── */}
      <LinearGradient
        colors={[DS.background, "#0E1A35", "#0F1535"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* ── Floating particles ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: 6 }, (_, i) => (
          <AmbientParticle key={i} delay={i * 800} x={Math.random() * SW} />
        ))}
      </View>

      {/* ── Ambient glow ── */}
      <Animated.View style={[styles.ambientGlow, glowStyle]} pointerEvents="none">
        <LinearGradient
          colors={["rgba(26, 61, 232, 0.4)", "transparent"]}
          style={styles.glowCircle}
        />
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.xl + 8, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══ Header ═══ */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.dispatch(DrawerActions.openDrawer());
            }}
            hitSlop={12}
            style={styles.headerBtn}
          >
            <View style={styles.headerBtnInner}>
              <Ionicons name="menu-outline" size={22} color={colors.text.primary} />
            </View>
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.logoText}>ERAMIX</Text>
            <View style={styles.logoStars}>
              {[...Array(5)].map((_, i) => (
                <View key={i} style={styles.logoStar} />
              ))}
            </View>
          </View>

          <Pressable
            onPress={() => navigation.navigate("HomeTabs", { screen: "Profile" })}
            hitSlop={12}
            style={styles.headerBtn}
          >
            <LinearGradient
              colors={["rgba(59, 107, 255, 0.3)", "rgba(59, 107, 255, 0.15)"]}
              style={styles.avatarSmall}
            >
              <Text style={styles.avatarInitial}>
                {user?.firstName?.charAt(0)?.toUpperCase() || "E"}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* ═══ Greeting hero ═══ */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.greetingContainer}>
          <Text style={styles.greetingLabel}>{greeting},</Text>
          <Text style={styles.userName}>{user?.firstName || "Erasmus"} ✨</Text>
          <Text style={styles.tagline}>Tu aventura europea, en una app</Text>
        </Animated.View>

        {/* ═══ Status banner — Glass ═══ */}
        <Animated.View entering={FadeInDown.delay(220).springify()}>
          <View style={styles.bannerOuter}>
            <BlurView intensity={25} tint="dark" style={styles.bannerBlur}>
              <LinearGradient
                colors={["rgba(59, 107, 255, 0.12)", "rgba(59, 107, 255, 0.03)"]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              {/* Glass top highlight */}
              <View style={styles.bannerHighlight} />

              <View style={styles.bannerContent}>
                <LinearGradient
                  colors={["rgba(255, 215, 0, 0.2)", "rgba(255, 215, 0, 0.08)"]}
                  style={styles.bannerIconWrap}
                >
                  <Ionicons name="school" size={20} color={colors.eu.star} />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerTitle}>Erasmus+ 2025/26</Text>
                  <Text style={styles.bannerSub}>Conecta con tu comunidad europea</Text>
                </View>
                <View style={styles.bannerArrow}>
                  <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
                </View>
              </View>
            </BlurView>
          </View>
        </Animated.View>

        {/* ═══ Metric Cards ═══ */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.metricsRow}>
          <GlassMetricCard
            title="Conexiones"
            value="—"
            icon="people-outline"
            trend="up"
            trendValue="+3"
            style={{ width: METRIC_W }}
          />
          <GlassMetricCard
            title="Eventos"
            value="—"
            icon="calendar-outline"
            iconColor={palette.coral}
            iconBgColor="rgba(255, 79, 111, 0.10)"
            style={{ width: METRIC_W }}
          />
        </Animated.View>

        {/* ═══ Quick Actions ═══ */}
        <Animated.View entering={FadeInDown.delay(380).springify()}>
          <SectionHeader title="Acceso rápido" />
          <QuickActionGrid actions={quickActions} columns={4} />
        </Animated.View>

        {/* ═══ Feature Cards Grid ═══ */}
        <View style={styles.featuresSection}>
          <SectionHeader title="Explora" action="Ver todo" />
          <View style={styles.featuresGrid}>
            {FEATURES.map((card, idx) => (
              <FeatureCardItem
                key={card.id}
                card={card}
                index={idx}
                onPress={() => navigation.navigate(card.route)}
              />
            ))}
          </View>
        </View>

        {/* ═══ AI Assistant CTA — Liquid Glass ═══ */}
        <Animated.View entering={FadeInDown.delay(650).springify()}>
          <Pressable
            style={({ pressed }) => [
              styles.ctaOuter,
              pressed && { opacity: 0.92, transform: [{ scale: 0.985 }] },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate("AiAssistant");
            }}
          >
            <BlurView intensity={20} tint="dark" style={styles.ctaBlur}>
              <LinearGradient
                colors={["rgba(255, 215, 0, 0.08)", "rgba(255, 109, 63, 0.04)"]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              {/* Top highlight refraction */}
              <View style={styles.ctaHighlight} />

              <View style={styles.ctaContent}>
                <LinearGradient
                  colors={["rgba(255, 215, 0, 0.18)", "rgba(255, 215, 0, 0.06)"]}
                  style={styles.ctaIconWrap}
                >
                  <Ionicons name="sparkles" size={22} color={colors.eu.star} />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ctaTitle}>Asistente AI</Text>
                  <Text style={styles.ctaSub}>Pregúntame sobre tu Erasmus</Text>
                </View>
                <View style={styles.ctaArrow}>
                  <Ionicons name="arrow-forward-circle" size={28} color={colors.eu.star} />
                </View>
              </View>
            </BlurView>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════════
// Styles — European Glass
// ═══════════════════════════════════════════════════
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg },

  // Ambient
  ambientGlow: {
    position: "absolute",
    top: -120,
    left: -80,
    right: -80,
    height: 400,
    alignItems: "center",
    justifyContent: "center",
  },
  glowCircle: { width: 420, height: 420, borderRadius: 210 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  headerBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerBtnInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: borders.hairline,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  logoText: {
    fontFamily: typography.families.heading,
    fontSize: 17,
    color: colors.eu.star,
    letterSpacing: 4,
  },
  logoStars: { flexDirection: "row", gap: 3, marginTop: 4 },
  logoStar: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.eu.star,
    opacity: 0.5,
  },
  avatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(59, 107, 255, 0.35)",
  },
  avatarInitial: {
    fontFamily: typography.families.subheading,
    fontSize: 14,
    color: colors.text.primary,
  },

  // Greeting
  greetingContainer: { marginBottom: spacing.xl },
  greetingLabel: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  userName: {
    fontFamily: typography.families.heading,
    fontSize: 30,
    color: colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: spacing.xxs,
  },
  tagline: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
  },

  // Banner
  bannerOuter: {
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: borders.hairline,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: spacing.xl,
  },
  bannerBlur: { overflow: "hidden", borderRadius: radii.xl },
  bannerHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
  },
  bannerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  bannerSub: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  bannerArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Metrics
  metricsRow: {
    flexDirection: "row",
    gap: CARD_GAP,
    marginBottom: spacing.xl,
  },

  // Features
  featuresSection: { marginTop: spacing.md, marginBottom: spacing.xl },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  featureCard: {
    width: (SW - spacing.lg * 2 - spacing.sm) / 2,
    borderRadius: radii.xl,
    overflow: "hidden",
    ...shadows.card,
  },
  featureGradient: {
    padding: spacing.md,
    paddingTop: spacing.sm,
    minHeight: 112,
    justifyContent: "flex-end",
  },
  featureGlassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  featureHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.20)",
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: borders.hairline,
    borderColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  featureTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: "#FFF",
  },
  featureSubtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.tiny.fontSize,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },
  featureCornerDot: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
  },

  // AI CTA
  ctaOuter: {
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: borders.hairline,
    borderColor: "rgba(255, 215, 0, 0.12)",
    marginTop: spacing.sm,
  },
  ctaBlur: { overflow: "hidden", borderRadius: radii.xl },
  ctaHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255, 215, 0, 0.15)",
  },
  ctaContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
  },
  ctaIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  ctaSub: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  ctaArrow: { marginLeft: spacing.xs },

  // Stories
  storyRing: { alignItems: "center", width: 68 },
  storyGradientRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  storyInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0A0C20",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0A0C20",
  },
  storyInitial: {
    fontFamily: typography.families.subheading,
    fontSize: 18,
    color: colors.text.primary,
  },
  storyName: {
    fontFamily: typography.families.body,
    fontSize: 10,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: "center",
  },
});
