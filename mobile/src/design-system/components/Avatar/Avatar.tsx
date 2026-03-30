import React from "react";
import { View, Image, Text, StyleSheet, ImageSourcePropType, ViewStyle, StyleProp } from "react-native";
import { colors, radii, typography, spacing } from "../../tokens";

export interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  size?: "sm" | "md" | "lg";
  online?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SIZES = { sm: 32, md: 44, lg: 64 } as const;
const FONT_SIZES = { sm: 12, md: 16, lg: 22 } as const;

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Avatar({
  source,
  name,
  size = "md",
  online,
  style,
}: AvatarProps): React.JSX.Element {
  const dim = SIZES[size];

  return (
    <View style={[{ width: dim, height: dim }, style]}>
      {source ? (
        <Image
          source={source}
          style={[styles.image, { width: dim, height: dim, borderRadius: dim / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: dim, height: dim, borderRadius: dim / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize: FONT_SIZES[size] }]}>
            {name ? getInitials(name) : "?"}
          </Text>
        </View>
      )}
      {online !== undefined && (
        <View
          style={[
            styles.indicator,
            {
              width: dim * 0.3,
              height: dim * 0.3,
              borderRadius: dim * 0.15,
              backgroundColor: online ? colors.status.success : colors.text.disabled,
              borderWidth: 2,
              borderColor: colors.background.end,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: "cover",
  },
  fallback: {
    backgroundColor: colors.eu.deep,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    color: colors.text.primary,
    fontFamily: typography.families.subheading,
    fontWeight: "600",
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
});
