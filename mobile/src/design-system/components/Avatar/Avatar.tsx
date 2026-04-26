import React from "react";
import { View, Image, Text, StyleSheet, ImageSourcePropType, ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, typography, shadows } from "../../tokens";

export interface AvatarProps {
  source?: ImageSourcePropType;
  uri?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  online?: boolean;
  ring?: boolean;
  ringColor?: string;
  style?: StyleProp<ViewStyle>;
}

const SIZES = { sm: 36, md: 48, lg: 72, xl: 96 } as const;
const FONT_SIZES = { sm: 13, md: 17, lg: 26, xl: 34 } as const;
const RING_W = { sm: 1.5, md: 2, lg: 2.5, xl: 3 } as const;

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

const GRAD_PAIRS: [string, string][] = [
  ["#1A3DE8", "#6B9CFF"],
  ["#8B5CF6", "#B47AFF"],
  ["#FF6D3F", "#FFD700"],
  ["#00D68F", "#00BFA6"],
  ["#FF4F6F", "#FF2D87"],
  ["#3B6BFF", "#00D4FF"],
];

function getGrad(name?: string): [string, string] {
  if (!name) return GRAD_PAIRS[0];
  const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % GRAD_PAIRS.length;
  return GRAD_PAIRS[idx];
}

export default function Avatar({
  source,
  uri,
  name,
  size = "md",
  online,
  ring = false,
  ringColor,
  style,
}: AvatarProps): React.JSX.Element {
  const dim = SIZES[size];
  const imgSource = source ?? (uri ? { uri } : undefined);
  const gradPair = getGrad(name);
  const rw = RING_W[size];
  const innerDim = dim - rw * 2;

  const renderContent = (d: number) =>
    imgSource ? (
      <Image source={imgSource} style={{ width: d, height: d, borderRadius: d / 2 }} resizeMode="cover" />
    ) : (
      <LinearGradient colors={gradPair} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: d, height: d, borderRadius: d / 2, justifyContent: "center", alignItems: "center" }}>
        <Text style={[styles.initials, { fontSize: FONT_SIZES[size] }]}>{name ? getInitials(name) : "?"}</Text>
      </LinearGradient>
    );

  return (
    <View style={[{ width: dim, height: dim }, style]}>
      {ring ? (
        <LinearGradient
          colors={ringColor ? [ringColor, ringColor] : ["#FFD700", "#FF6D3F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: dim, height: dim, borderRadius: dim / 2, padding: rw, alignItems: "center", justifyContent: "center" }}
        >
          <View style={{ width: innerDim, height: innerDim, borderRadius: innerDim / 2, overflow: "hidden" }}>
            {renderContent(innerDim)}
          </View>
        </LinearGradient>
      ) : (
        <View style={{ width: dim, height: dim, borderRadius: dim / 2, overflow: "hidden" }}>
          {renderContent(dim)}
        </View>
      )}
      {online !== undefined && (
        <View
          style={[
            styles.indicator,
            {
              width: dim * 0.28,
              height: dim * 0.28,
              borderRadius: dim * 0.14,
              backgroundColor: online ? colors.status.online : colors.status.offline,
              borderWidth: 2.5,
              borderColor: "#04061A",
              right: ring ? 1 : 0,
              bottom: ring ? 1 : 0,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  initials: {
    fontFamily: typography.families.heading,
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  indicator: {
    position: "absolute",
    ...shadows.sm,
  },
});
