/**
 * ────────────────────────────────────────────────────────
 *  AnimatedBottomSheet — Sheet con gestos y animación
 * ────────────────────────────────────────────────────────
 */

import React, { useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Modal,
  ViewStyle,
} from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import {
  colors,
  typography,
  spacing,
  radii,
  animation,
} from "../../tokens";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface AnimatedBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  snapPoint?: number; // 0-1 percentage of screen height
  children: React.ReactNode;
  style?: ViewStyle;
}

export function AnimatedBottomSheet({
  visible,
  onDismiss,
  title,
  snapPoint = 0.5,
  children,
  style,
}: AnimatedBottomSheetProps): React.JSX.Element | null {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const sheetHeight = SCREEN_HEIGHT * snapPoint;

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, animation.spring.gentle);
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      translateY.value = withSpring(SCREEN_HEIGHT, animation.spring.snappy);
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleDismiss = useCallback(() => {
    translateY.value = withSpring(SCREEN_HEIGHT, animation.spring.snappy, () => {
      runOnJS(onDismiss)();
    });
    backdropOpacity.value = withTiming(0, { duration: 200 });
  }, [onDismiss]);

  return (
    <Modal transparent visible={visible} statusBarTranslucent animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            { height: sheetHeight },
            sheetStyle,
            style,
          ]}
        >
          <BlurView intensity={40} tint="dark" style={styles.blurContent}>
            <View style={styles.handle} />
            {title && <Text style={styles.title}>{title}</Text>}
            <View style={styles.content}>{children}</View>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  sheet: {
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    overflow: "hidden",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.glass.border,
  },
  blurContent: {
    flex: 1,
    overflow: "hidden",
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.glass.white,
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h4.fontSize,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
});
