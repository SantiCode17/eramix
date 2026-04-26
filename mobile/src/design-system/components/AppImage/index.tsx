/**
 * ════════════════════════════════════════════════════
 *  AppImage — Componente de imagen reutilizable
 *  Maneja estados de carga, error y placeholder.
 * ════════════════════════════════════════════════════
 */

import React, { useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  ImageStyle,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, DS } from "../../tokens";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

export interface AppImageProps {
  uri?: string | null;
  fallbackIcon?: IoniconsName;
  fallbackText?: string;
  size?: number;
  width?: number;
  height?: number;
  borderRadius?: number;
  style?: ImageStyle | ViewStyle;
  iconSize?: number;
  iconColor?: string;
  backgroundColor?: string;
}

export default function AppImage({
  uri,
  fallbackIcon = "image-outline",
  size,
  width,
  height,
  borderRadius = radii.md,
  style,
  iconSize = 24,
  iconColor = colors.text.tertiary,
  backgroundColor = "rgba(255,255,255,0.04)",
}: AppImageProps): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const w = width ?? size ?? 80;
  const h = height ?? size ?? 80;

  const containerStyle: ViewStyle = {
    width: w,
    height: h,
    borderRadius,
    backgroundColor,
    overflow: "hidden",
  };

  if (!uri || error) {
    return (
      <View style={[containerStyle, styles.placeholder, style as ViewStyle]}>
        <Ionicons name={fallbackIcon} size={iconSize} color={iconColor} />
      </View>
    );
  }

  return (
    <View style={[containerStyle, style as ViewStyle]}>
      <Image
        source={{ uri }}
        style={{ width: w, height: h, borderRadius }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        resizeMode="cover"
      />
      {loading && (
        <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
          <ActivityIndicator size="small" color={DS.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
  },
  loadingOverlay: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
});
