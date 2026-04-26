/**
 * ══════════════════════════════════════════════════════════════════════
 *  OnboardingScreen — Premium First-Launch Experience
 *
 *  • 5 slides con iconos animados (sin imágenes externas)
 *  • Todo perfectamente centrado vertical y horizontalmente
 *  • Parallax con Animated API nativa
 *  • Dots animados + botón premium
 *  • Gradientes suaves por slide
 *  • Diseño limpio, minimalista, centrado
 * ══════════════════════════════════════════════════════════════════════
 */
import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { AuthStackParamList } from "@/types";

const { width, height } = Dimensions.get("window");
const ONBOARDING_KEY = "eramix_onboarding_complete";
type Nav = StackNavigationProp<AuthStackParamList, "Onboarding">;

/* ─── Slide Data ─── */
interface Slide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  ringColor: string;
  title: string;
  subtitle: string;
  gradient: [string, string, string];
  emoji: string;
}

const slides: Slide[] = [
  {
    id: "1",
    icon: "people",
    iconColor: "#FFD700",
    ringColor: "#FFD70030",
    title: "Haz amigos reales\nen tu Erasmus",
    subtitle:
      "Sin citas, sin rollos. Solo gente con ganas de conocerse y vivir la experiencia juntos.",
    gradient: ["#0A1628", "#0E1A35", "#0A1628"],
    emoji: "🤝",
  },
  {
    id: "2",
    icon: "compass",
    iconColor: "#00D4AA",
    ringColor: "#00D4AA25",
    title: "Descubre quién\nhay cerca de ti",
    subtitle:
      "Encuentra Erasmus en tu ciudad que comparten tus intereses y tu misma energía.",
    gradient: ["#0A1628", "#0B1D30", "#0A1628"],
    emoji: "🌍",
  },
  {
    id: "3",
    icon: "chatbubbles",
    iconColor: "#6C5CE7",
    ringColor: "#6C5CE725",
    title: "Practica idiomas\ncon nativos reales",
    subtitle:
      "Intercambio lingüístico auténtico. Mejora mientras haces amigos de verdad.",
    gradient: ["#0A1628", "#10182E", "#0A1628"],
    emoji: "🗣️",
  },
  {
    id: "4",
    icon: "calendar",
    iconColor: "#FF6B2B",
    ringColor: "#FF6B2B25",
    title: "Únete a planes\ny eventos épicos",
    subtitle:
      "Fiestas, viajes, quedadas, cultura. Tu agenda Erasmus en un solo lugar.",
    gradient: ["#0A1628", "#0F1830", "#0A1628"],
    emoji: "🎉",
  },
  {
    id: "5",
    icon: "rocket",
    iconColor: "#FFD700",
    ringColor: "#FFD70020",
    title: "Tu aventura\nempieza ahora",
    subtitle:
      "Miles de Erasmus te esperan. Únete a EraMix y empieza a vivir al máximo.",
    gradient: ["#0A1628", "#0E1A35", "#0A1628"],
    emoji: "✨",
  },
];

/* ══════════════════════════════════════════════════════════════════════ */
export default function OnboardingScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [scrollX] = useState(() => new Animated.Value(0));
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLast = currentIndex === slides.length - 1;

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / width);
      setCurrentIndex(idx);
    },
    []
  );

  const handleNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  }, [currentIndex]);

  const handleGetStarted = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: "Login" }] })
    );
  }, [navigation]);

  /* ── Render Slide ── */
  const renderSlide = ({
    item,
    index,
  }: {
    item: Slide;
    index: number;
  }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const iconScale = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: "clamp",
    });

    const iconOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: "clamp",
    });

    const textTranslateY = scrollX.interpolate({
      inputRange,
      outputRange: [40, 0, 40],
      extrapolate: "clamp",
    });

    const textOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: "clamp",
    });

    return (
      <View style={st.slide}>
        <LinearGradient colors={item.gradient} style={StyleSheet.absoluteFill} />

        {/* ── Centered Content ── */}
        <View style={st.slideContent}>
          {/* Icon Ring */}
          <Animated.View
            style={[
              st.iconRingOuter,
              { backgroundColor: item.ringColor, opacity: iconOpacity, transform: [{ scale: iconScale }] },
            ]}
          >
            <View style={[st.iconRingInner, { borderColor: `${item.iconColor}20` }]}>
              <Text style={st.slideEmoji}>{item.emoji}</Text>
              <View style={[st.iconCircle, { backgroundColor: `${item.iconColor}15`, borderColor: `${item.iconColor}30` }]}>
                <Ionicons name={item.icon} size={48} color={item.iconColor} />
              </View>
            </View>
          </Animated.View>

          {/* Text */}
          <Animated.View
            style={[
              st.textBlock,
              { opacity: textOpacity, transform: [{ translateY: textTranslateY }] },
            ]}
          >
            <Text style={[st.title, { color: item.iconColor }]}>
              {item.title}
            </Text>
            <Text style={st.subtitle}>{item.subtitle}</Text>
          </Animated.View>
        </View>
      </View>
    );
  };

  return (
    <View style={st.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumEnd}
      />

      {/* ── Bottom Controls (absolutely centered) ── */}
      <View style={[st.bottomArea, { paddingBottom: insets.bottom + 30 }]}>
        {/* Dots */}
        <View style={st.dotsRow}>
          {slides.map((_, i) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [8, 28, 8],
              extrapolate: "clamp",
            });
            const dotOpacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.25, 1, 0.25],
              extrapolate: "clamp",
            });
            const dotColor = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: ["#FFFFFF40", slides[i].iconColor, "#FFFFFF40"],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={i}
                style={[st.dot, { width: dotWidth, opacity: dotOpacity, backgroundColor: dotColor }]}
              />
            );
          })}
        </View>

        {/* Main Button */}
        <Pressable
          onPress={isLast ? handleGetStarted : handleNext}
          style={({ pressed }) => [st.mainBtn, pressed && { transform: [{ scale: 0.97 }] }]}
        >
          <LinearGradient
            colors={isLast ? ["#FFD700", "#FF6B2B"] : ["rgba(255,255,255,0.10)", "rgba(255,255,255,0.05)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={st.mainBtnGrad}
          >
            <Text style={[st.mainBtnTxt, isLast && { color: "#0A1628" }]}>
              {isLast ? "Empezar mi Erasmus 🚀" : "Siguiente"}
            </Text>
            {!isLast && (
              <Ionicons name="arrow-forward" size={18} color={colors.text.primary} style={{ marginLeft: 6 }} />
            )}
          </LinearGradient>
        </Pressable>

        {/* Skip */}
        {!isLast && (
          <Pressable onPress={handleGetStarted} style={st.skipBtn}>
            <Text style={st.skipTxt}>Saltar</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A1628" },

  /* Slide */
  slide: { width, height },
  slideContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: 180, // offset for bottom controls
  },

  /* Icon */
  iconRingOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  iconRingInner: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  slideEmoji: {
    fontSize: 28,
    position: "absolute",
    top: 8,
    right: 8,
  },

  /* Text */
  textBlock: {
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  title: {
    fontFamily: typography.families.heading,
    fontSize: 32,
    textAlign: "center",
    lineHeight: 40,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontFamily: typography.families.body,
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 320,
  },

  /* Bottom */
  bottomArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },

  /* Button */
  mainBtn: {
    width: "100%",
    borderRadius: radii.lg,
    overflow: "hidden",
    marginBottom: 14,
  },
  mainBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: radii.lg,
  },
  mainBtnTxt: {
    fontFamily: typography.families.subheading,
    fontSize: 17,
    color: colors.text.primary,
  },

  /* Skip */
  skipBtn: { paddingVertical: 8 },
  skipTxt: {
    fontFamily: typography.families.body,
    fontSize: 15,
    color: colors.text.tertiary,
  },
});
