import React, { useEffect, useState } from "react";
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Animated,
  ViewStyle,
  StyleProp,
  Dimensions,
} from "react-native";
import {
  colors,
  radii,
  opacity,
  blur as blurTokens,
  animation,
  spacing,
} from "../../tokens";

export interface GlassModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function GlassModal({
  visible,
  onClose,
  children,
  style,
}: GlassModalProps): React.JSX.Element {
  const [slideAnim] = useState(() => new Animated.Value(SCREEN_HEIGHT));
  const [backdropAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          ...animation.spring.gentle,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: animation.duration.normal,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: animation.duration.normal,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: animation.duration.normal,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0, 0, 0, 0.6)" }]} />
          </Pressable>
        </Animated.View>

        <Animated.View
          style={[
            styles.content,
            { transform: [{ translateY: slideAnim }] },
            style,
          ]}
        >
          <View style={styles.handle} />
          <View style={[styles.blur, { backgroundColor: "rgba(26, 26, 46, 0.95)" }]}>
            <View style={styles.inner}>
              {children}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  content: {
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: "hidden",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: `rgba(255, 255, 255, ${opacity.border.strong})`,
    borderRadius: radii.full,
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    zIndex: 1,
  },
  blur: {
    overflow: "hidden",
  },
  inner: {
    backgroundColor: `rgba(255, 255, 255, ${opacity.glass.elevated})`,
    borderTopWidth: 1,
    borderColor: `rgba(255, 255, 255, ${opacity.border.mid})`,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
