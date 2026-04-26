/**
 * ════════════════════════════════════════════════════════
 *  MatchCelebrationModal — Confetti Explosion + Match Card
 *  Aparece cuando dos usuarios se dan like mutuamente
 * ════════════════════════════════════════════════════════
 */

import React, { useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
  ZoomIn,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { User } from "@/types";

const { width: W } = Dimensions.get("window");

/* ── Confetti config ────────────────────────────── */

const COLOURS = [
  "#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1",
  "#96CEB4", "#FFEAA7", "#DDA0DD", "#BB8FCE",
  "#F7DC6F", "#5DADE2", "#FF8C42", "#A8E063",
];

type ConfettiShape = "square" | "circle" | "rect";

interface Particle {
  id: number;
  color: string;
  /** Destination X offset from screen center */
  destX: number;
  /** Destination Y offset from screen center (negative = up) */
  destY: number;
  rotation: number;
  size: number;
  shape: ConfettiShape;
  delay: number;
}

/** Deterministic set to avoid re-computation on re-renders */
const PARTICLES: Particle[] = Array.from({ length: 72 }, (_, i) => {
  const angle = (i / 72) * Math.PI * 2;
  const radius = 80 + (i % 7) * 55;
  return {
    id: i,
    color: COLOURS[i % COLOURS.length],
    destX: Math.cos(angle) * radius * (1 + (i % 3) * 0.3),
    destY: Math.sin(angle) * radius * (1 + (i % 3) * 0.3),
    rotation: (i * 53) % 720 - 360,
    size: 6 + (i % 8),
    shape: (["square", "circle", "rect"] as const)[i % 3],
    delay: (i % 14) * 18,
  };
});

/* ── Single confetti particle ───────────────────── */

function ConfettiParticle({ p }: { p: Particle }) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const rot = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.1);

  useEffect(() => {
    const dur = 900 + (p.id % 6) * 100;
    tx.value = withDelay(
      p.delay,
      withTiming(p.destX, { duration: dur, easing: Easing.out(Easing.quad) }),
    );
    ty.value = withDelay(
      p.delay,
      withTiming(p.destY, { duration: dur + 150, easing: Easing.out(Easing.quad) }),
    );
    rot.value = withDelay(p.delay, withTiming(p.rotation, { duration: dur }));
    scale.value = withDelay(
      p.delay,
      withSpring(1, { damping: 8, stiffness: 220 }),
    );
    opacity.value = withDelay(
      p.delay + 550,
      withTiming(0, { duration: 480, easing: Easing.in(Easing.quad) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${rot.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[ps.base, style]}>
      <View
        style={{
          width: p.shape === "rect" ? p.size * 2.2 : p.size,
          height: p.size,
          backgroundColor: p.color,
          borderRadius: p.shape === "circle" ? p.size / 2 : 2,
        }}
      />
    </Animated.View>
  );
}

const ps = StyleSheet.create({
  base: { position: "absolute" },
});

/* ── Main modal ─────────────────────────────────── */

interface Props {
  visible: boolean;
  matchedUser: User;
  myPhotoUrl?: string | null;
  onGoToChat: () => void;
  onContinue: () => void;
}

export default function MatchCelebrationModal({
  visible,
  matchedUser,
  myPhotoUrl,
  onGoToChat,
  onContinue,
}: Props): React.JSX.Element | null {
  /* Haptic on show */
  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [visible]);

  if (!visible) return null;

  const matchedName = matchedUser.firstName ?? "Alguien";

  return (
    <Modal
      transparent
      animationType="fade"
      statusBarTranslucent
      visible={visible}
    >
      <View style={ms.overlay}>

        {/* ── Confetti burst (pointer-events none so it doesn't block touches) ── */}
        <View style={ms.confettiRoot} pointerEvents="none">
          {/* Use matchedUser.id as key so particles reset if modal shows again */}
          {PARTICLES.map((p) => (
            <ConfettiParticle key={`${matchedUser.id}-${p.id}`} p={p} />
          ))}
        </View>

        {/* ── Card ── */}
        <Animated.View
          entering={ZoomIn.springify().damping(14).stiffness(120)}
          style={ms.card}
        >
          <LinearGradient
            colors={["#0C1030", "#14193E", "#0C1030"]}
            style={ms.cardInner}
          >
            {/* Ambient glow */}
            <Animated.View entering={FadeIn.delay(400)} style={ms.glow} />

            {/* Title */}
            <Animated.Text
              entering={FadeInDown.delay(150).springify()}
              style={ms.title}
            >
              ¡Es un Match! 🎉
            </Animated.Text>

            {/* Subtitle */}
            <Animated.Text
              entering={FadeInDown.delay(260).springify()}
              style={ms.subtitle}
            >
              ¡Tú y {matchedName} os gustáis mutuamente!
            </Animated.Text>

            {/* Photos row */}
            <Animated.View
              entering={ZoomIn.delay(300).springify().damping(12)}
              style={ms.photosRow}
            >
              {/* My photo */}
              <View style={ms.photoWrap}>
                {myPhotoUrl ? (
                  <Image
                    source={{ uri: myPhotoUrl }}
                    style={ms.photo}
                  />
                ) : (
                  <View style={[ms.photo, ms.photoFallback]}>
                    <Text style={ms.photoFallbackText}>Tú</Text>
                  </View>
                )}
                <View style={ms.photoRing} />
              </View>

              <Text style={ms.heart}>💛</Text>

              {/* Their photo */}
              <View style={ms.photoWrap}>
                {matchedUser.profilePhotoUrl ? (
                  <Image
                    source={{ uri: matchedUser.profilePhotoUrl }}
                    style={ms.photo}
                  />
                ) : (
                  <View style={[ms.photo, ms.photoFallback]}>
                    <Text style={ms.photoFallbackText}>
                      {matchedName[0]?.toUpperCase() ?? "?"}
                    </Text>
                  </View>
                )}
                <View style={ms.photoRing} />
              </View>
            </Animated.View>

            {/* Message */}
            <Animated.Text
              entering={FadeInDown.delay(460)}
              style={ms.message}
            >
              Podéis empezar a chatear ahora mismo
            </Animated.Text>

            {/* Buttons */}
            <Animated.View entering={FadeInDown.delay(560)} style={ms.buttons}>
              <Pressable onPress={onGoToChat} style={ms.chatBtnWrap}>
                <LinearGradient
                  colors={["#FFD700", "#F59E0B"]}
                  style={ms.chatBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={ms.chatBtnText}>💬  Enviar un mensaje</Text>
                </LinearGradient>
              </Pressable>

              <Pressable onPress={onContinue} style={ms.continueBtn}>
                <Text style={ms.continueBtnText}>Seguir descubriendo →</Text>
              </Pressable>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

/* ── Styles ──────────────────────────────────────── */

const ms = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },
  confettiRoot: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: W * 0.88,
    borderRadius: radii.xxl,
    overflow: "hidden",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 24,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.35)",
  },
  cardInner: {
    padding: 32,
    alignItems: "center",
  },
  glow: {
    position: "absolute",
    top: -60,
    left: "50%",
    marginLeft: -130,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,215,0,0.07)",
  },
  title: {
    fontFamily: typography.families.heading,
    fontSize: 34,
    color: "#FFD700",
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  photosRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  photoWrap: { position: "relative" },
  photo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "#FFD700",
  },
  photoFallback: {
    backgroundColor: colors.eu.deep,
    alignItems: "center",
    justifyContent: "center",
  },
  photoFallbackText: {
    fontFamily: typography.families.heading,
    fontSize: 26,
    color: "#FFD700",
  },
  photoRing: {
    position: "absolute",
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 53,
    borderWidth: 1.5,
    borderColor: "rgba(255,215,0,0.3)",
  },
  heart: { fontSize: 30 },
  message: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.tertiary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  buttons: {
    width: "100%",
    gap: spacing.sm,
  },
  chatBtnWrap: {
    borderRadius: radii.full,
    overflow: "hidden",
  },
  chatBtn: {
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: radii.full,
  },
  chatBtnText: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.body.fontSize,
    color: "#0A0F2E",
    letterSpacing: 0.5,
  },
  continueBtn: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  continueBtnText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.tertiary,
  },
});
