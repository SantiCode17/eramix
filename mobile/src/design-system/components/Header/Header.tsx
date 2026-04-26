import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, borders } from "../../tokens";

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  variant?: "transparent" | "glass" | "solid";
  left?: React.ReactNode;
  right?: React.ReactNode;
  onBack?: () => void;
  /** Show drawer hamburger button when no onBack is provided */
  showDrawer?: boolean;
  large?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function Header({
  title,
  subtitle,
  variant = "glass",
  left,
  right,
  onBack,
  showDrawer = false,
  large = false,
  style,
}: HeaderProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const renderLeft = () => {
    if (left) return left;
    if (onBack) {
      return (
        <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
          <View style={styles.backCircle}>
            <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
          </View>
        </Pressable>
      );
    }
    if (showDrawer) {
      return (
        <Pressable
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          hitSlop={12}
          style={styles.backBtn}
        >
          <View style={styles.backCircle}>
            <Ionicons name="menu" size={20} color={colors.text.primary} />
          </View>
        </Pressable>
      );
    }
    return <View style={styles.placeholder} />;
  };

  const titleEl = large ? (
    <View style={styles.largeTitleContainer}>
      <Text style={styles.largeTitle} numberOfLines={1}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
    </View>
  ) : (
    <View style={styles.center}>
      {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitleSmall} numberOfLines={1}>{subtitle}</Text> : null}
    </View>
  );

  const inner = (
    <View style={[styles.container, { paddingTop: insets.top + 4 }, large && styles.containerLarge]}>
      {large ? (
        <>
          <View style={styles.topRow}>
            <View style={styles.side}>{renderLeft()}</View>
            <View style={[styles.side, styles.sideRight]}>{right ?? <View style={styles.placeholder} />}</View>
          </View>
          {titleEl}
        </>
      ) : (
        <>
          <View style={styles.side}>{renderLeft()}</View>
          {titleEl}
          <View style={[styles.side, styles.sideRight]}>{right ?? <View style={styles.placeholder} />}</View>
        </>
      )}
    </View>
  );

  if (variant === "transparent") {
    return <View style={[styles.wrapper, style]}>{inner}</View>;
  }

  if (variant === "solid") {
    return (
      <View style={[styles.wrapper, styles.solidBg, styles.border, style]}>
        {inner}
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, style]}>
      <LinearGradient
        colors={["rgba(11, 14, 42, 0.92)", "rgba(6, 8, 26, 0.80)"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.border} />
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { zIndex: 10, overflow: "hidden" },
  solidBg: { backgroundColor: "#04061A" },
  border: { borderBottomWidth: borders.hairline, borderBottomColor: colors.glass.border },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    minHeight: 52,
  },
  containerLarge: { flexDirection: "column", alignItems: "stretch", paddingBottom: spacing.md },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm },
  side: { minWidth: 44, alignItems: "flex-start" },
  sideRight: { alignItems: "flex-end" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.sm },
  title: { fontFamily: typography.families.subheading, fontSize: 18, color: colors.text.primary, letterSpacing: -0.3 },
  subtitleSmall: { fontFamily: typography.families.body, fontSize: 12, color: colors.text.secondary, marginTop: 1 },
  largeTitleContainer: { paddingHorizontal: 4 },
  largeTitle: { fontFamily: typography.families.heading, fontSize: 30, color: colors.text.primary, letterSpacing: -0.8 },
  subtitle: { fontFamily: typography.families.body, fontSize: 14, color: colors.text.secondary, marginTop: 2 },
  backBtn: { padding: 2 },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glass.white,
    borderWidth: borders.hairline,
    borderColor: colors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: { width: 36 },
});
