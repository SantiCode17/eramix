/**
 * BackButton — Componente universal de navegación atrás
 * Flecha dorada sobre fondo navy, consistente en toda la app.
 */

import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  EramixColors as C,
  EramixSpacing as S,
} from "@/constants/theme";

interface BackButtonProps {
  /** Override default goBack behavior */
  onPress?: () => void;
  /** Icon color — defaults to PRIMARY_GOLD */
  color?: string;
  /** Size of the touchable circle — defaults to 40 */
  size?: number;
}

export default function BackButton({
  onPress,
  color = C.PRIMARY_GOLD,
  size = 40,
}: BackButtonProps): React.JSX.Element {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name="chevron-back" size={22} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.NAVY_SURFACE,
    borderWidth: 1,
    borderColor: C.NAVY_BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.7 },
});
