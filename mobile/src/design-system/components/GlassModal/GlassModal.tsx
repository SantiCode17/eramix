import React, { useEffect, useRef } from "react";
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
import { BlurView } from "expo-blur";
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
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

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
            <BlurView intensity={blurTokens.overlay} tint="dark" style={StyleSheet.absoluteFill} />
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
          <BlurView intensity={blurTokens.elevated} tint="dark" style={styles.blur}>
            <View style={styles.inner}>
              {children}
            </View>
          </BlurView>
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
