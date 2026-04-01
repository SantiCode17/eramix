import React from "react";
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native";
import * as Haptics from "expo-haptics";
import { colors, typography, spacing, radii, opacity, blur as blurTokens } from "../../tokens";
import { Badge } from "../Badge";

export interface TabBarItem {
  key: string;
  label: string;
  icon: string;
  activeIcon?: string;
  badge?: number;
}

export interface TabBarProps {
  items: TabBarItem[];
  activeKey: string;
  onPress: (key: string) => void;
  style?: StyleProp<ViewStyle>;
}

export default function TabBar({
  items,
  activeKey,
  onPress,
  style,
}: TabBarProps): React.JSX.Element {
  const handlePress = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(key);
  };

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[styles.blur, { backgroundColor: "rgba(26, 26, 46, 0.92)" }]}>
        <View style={styles.container}>
          {items.map((item) => {
            const isActive = item.key === activeKey;
            return (
              <Pressable
                key={item.key}
                onPress={() => handlePress(item.key)}
                style={styles.tab}
              >
                <View style={styles.iconWrapper}>
                  <Text style={[styles.icon, isActive && styles.iconActive]}>
                    {isActive && item.activeIcon ? item.activeIcon : item.icon}
                  </Text>
                  {isActive && <View style={styles.activeIndicator} />}
                  {item.badge !== undefined && item.badge > 0 && (
                    <View style={styles.badge}>
                      <Badge count={item.badge} variant="error" />
                    </View>
                  )}
                </View>
                <Text
                  style={[styles.label, isActive && styles.labelActive]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: `rgba(255, 255, 255, ${opacity.border.subtle})`,
  },
  blur: {
    overflow: "hidden",
  },
  container: {
    flexDirection: "row",
    backgroundColor: `rgba(255, 255, 255, ${opacity.glass.surface})`,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs,
  },
  iconWrapper: {
    position: "relative",
    marginBottom: spacing.xxs,
  },
  icon: {
    fontSize: 22,
    opacity: 0.5,
  },
  iconActive: {
    opacity: 1,
  },
  activeIndicator: {
    position: "absolute",
    bottom: -4,
    alignSelf: "center",
    left: "50%",
    marginLeft: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.eu.star,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
  },
  label: {
    fontSize: typography.sizes.tab.fontSize,
    fontFamily: typography.families.body,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  labelActive: {
    color: colors.text.primary,
    fontFamily: typography.families.bodyMedium,
    fontWeight: "500",
  },
});
