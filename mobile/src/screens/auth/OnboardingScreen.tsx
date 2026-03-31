import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { GlassButton } from "@/design-system";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { AuthStackParamList } from "@/types";

const { width, height } = Dimensions.get("window");
const ONBOARDING_KEY = "eramix_onboarding_complete";

type Nav = StackNavigationProp<AuthStackParamList, "Onboarding">;

interface Slide {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  gradient: readonly [string, string];
}

const slides: Slide[] = [
  {
    id: "1",
    emoji: "🤝",
    title: "Amigos reales",
    subtitle:
      "Haz amigos de verdad en tu ciudad Erasmus. Sin citas, sin rollos. Solo gente con ganas de conocerse.",
    gradient: ["#003399", "#1A4DB3"],
  },
  {
    id: "2",
    emoji: "🎯",
    title: "Tus intereses",
    subtitle:
      "Conecta con personas que comparten tus hobbies: música, deporte, arte, idiomas, viajes y mucho más.",
    gradient: ["#1A4DB3", "#2B5EC6"],
  },
  {
    id: "3",
    emoji: "🎉",
    title: "Eventos y planes",
    subtitle:
      "Descubre y crea eventos: quedadas, fiestas, viajes, intercambios de idiomas. Tu agenda Erasmus en un solo lugar.",
    gradient: ["#2B5EC6", "#003399"],
  },
  {
    id: "4",
    emoji: "🌍",
    title: "Tu comunidad",
    subtitle:
      "Miles de Erasmus te esperan. Únete a EraMix y empieza a vivir tu experiencia al máximo.",
    gradient: ["#003399", "#1A1A2E"],
  },
];

export default function OnboardingScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const flatListRef = useRef<FlatList>(null);
  const [scrollX] = useState(() => new Animated.Value(0));
  const [currentIndex, setCurrentIndex] = useState(0);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false },
  );

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(idx);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: "Login" }] }),
    );
  };

  const isLast = currentIndex === slides.length - 1;

  const renderSlide = ({ item, index }: { item: Slide; index: number }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const emojiScale = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: "clamp",
    });

    const emojiOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: "clamp",
    });

    const textTranslateY = scrollX.interpolate({
      inputRange,
      outputRange: [30, 0, 30],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.slide}>
        <LinearGradient
          colors={item.gradient}
          style={StyleSheet.absoluteFill}
        />

        {/* Illustration area */}
        <View style={styles.illustrationArea}>
          <Animated.Text
            style={[
              styles.emoji,
              {
                opacity: emojiOpacity,
                transform: [{ scale: emojiScale }],
              },
            ]}
          >
            {item.emoji}
          </Animated.Text>
        </View>

        {/* Text area */}
        <Animated.View
          style={[
            styles.textArea,
            { transform: [{ translateY: textTranslateY }] },
          ]}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
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

      {/* Bottom controls */}
      <View style={styles.bottomContainer}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, i) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [8, 24, 8],
              extrapolate: "clamp",
            });
            const dotOpacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]}
              />
            );
          })}
        </View>

        {/* Button */}
        <View style={styles.buttonContainer}>
          {isLast ? (
            <GlassButton
              title="Empezar"
              variant="primary"
              size="lg"
              onPress={handleGetStarted}
              style={styles.button}
            />
          ) : (
            <GlassButton
              title="Siguiente"
              variant="secondary"
              size="lg"
              onPress={handleNext}
              style={styles.button}
            />
          )}
        </View>

        {/* Skip */}
        {!isLast && (
          <GlassButton
            title="Saltar"
            variant="ghost"
            size="sm"
            onPress={handleGetStarted}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.end,
  },
  slide: {
    width,
    height,
    justifyContent: "center",
  },
  illustrationArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: spacing.xl,
  },
  emoji: {
    fontSize: 120,
  },
  textArea: {
    flex: 0.45,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  title: {
    fontFamily: typography.families.heading,
    fontSize: 36,
    color: colors.eu.star,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  subtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.eu.star,
  },
  buttonContainer: {
    width: "100%",
    marginBottom: spacing.md,
  },
  button: {
    width: "100%",
  },
});
