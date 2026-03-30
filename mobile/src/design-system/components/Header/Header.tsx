import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  colors,
  typography,
  spacing,
  opacity,
  blur as blurTokens,
} from "../../tokens";

export interface HeaderProps {
  title?: string;
  variant?: "transparent" | "glass" | "solid";
  left?: React.ReactNode;
  right?: React.ReactNode;
  onBack?: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function Header({
  title,
  variant = "glass",
  left,
  right,
  onBack,
  style,
}: HeaderProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  const renderLeft = () => {
    if (left) return left;
    if (onBack) {
      return (
        <Pressable onPress={onBack} hitSlop={10} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
      );
    }
    return <View style={styles.placeholder} />;
  };

  const inner = (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xs }]}>
      <View style={styles.side}>{renderLeft()}</View>
      <View style={styles.center}>
        {title ? (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
      </View>
      <View style={[styles.side, styles.sideRight]}>
        {right ?? <View style={styles.placeholder} />}
      </View>
    </View>
  );

  if (variant === "transparent") {
    return <View style={[styles.wrapper, style]}>{inner}</View>;
  }

  if (variant === "solid") {
    return (
      <View
        style={[
          styles.wrapper,
          { backgroundColor: colors.background.end },
          styles.border,
          style,
        ]}
      >
        {inner}
      </View>
    );
  }

  // glass (default)
  return (
    <View style={[styles.wrapper, styles.border, style]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(26, 26, 46, 0.92)" }]} />
      <View style={[StyleSheet.absoluteFill, styles.glassOverlay]} />
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    overflow: "hidden",
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: `rgba(255, 255, 255, ${opacity.border.subtle})`,
  },
  glassOverlay: {
    backgroundColor: `rgba(255, 255, 255, ${opacity.glass.surface})`,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    minHeight: 44,
  },
  side: {
    width: 48,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  sideRight: {
    alignItems: "flex-end",
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.sizes.body.fontSize,
    fontFamily: typography.families.subheading,
    fontWeight: "600",
  },
  backBtn: {
    padding: spacing.xs,
  },
  backIcon: {
    color: colors.text.primary,
    fontSize: 22,
  },
  placeholder: {
    width: 32,
  },
});
