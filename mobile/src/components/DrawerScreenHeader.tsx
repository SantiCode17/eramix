/**
 * ════════════════════════════════════════════════════════════════
 *  DrawerScreenHeader — Header reutilizable para pantallas Drawer
 *  Muestra hamburguesa (pantalla principal) o flecha atrás (sub-pantalla)
 * ════════════════════════════════════════════════════════════════
 */

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  EramixColors as C,
  EramixSpacing as S,
  EramixSizes as Sz,
  EramixTypography as T,
} from "@/constants/theme";

interface DrawerScreenHeaderProps {
  title: string;
  /** Si true muestra flecha atrás en vez de hamburguesa */
  showBack?: boolean;
  /** Elemento a renderizar a la derecha */
  rightElement?: React.ReactNode;
}

export default function DrawerScreenHeader({
  title,
  showBack = false,
  rightElement,
}: DrawerScreenHeaderProps) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const handleLeftPress = () => {
    if (showBack) {
      navigation.goBack();
    } else {
      navigation.dispatch(DrawerActions.openDrawer());
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + S.SPACE_SM }]}>
      <Pressable
        onPress={handleLeftPress}
        style={styles.iconButton}
        hitSlop={12}
      >
        <Ionicons
          name={showBack ? "arrow-back" : "menu"}
          size={22}
          color={C.TEXT_PRIMARY}
        />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.rightSlot}>
        {rightElement ?? <View style={styles.iconButton} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: S.SPACE_MD,
    paddingBottom: S.SPACE_SM,
    backgroundColor: C.NAVY_DEEP,
  },
  iconButton: {
    width: Sz.DRAWER_BUTTON,
    height: Sz.DRAWER_BUTTON,
    borderRadius: Sz.DRAWER_BUTTON / 2,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    color: C.TEXT_PRIMARY,
    fontSize: T.FONT_TITLE_MD.fontSize,
    fontWeight: T.FONT_TITLE_MD.fontWeight,
    textAlign: "center",
    marginHorizontal: S.SPACE_SM,
  },
  rightSlot: {
    minWidth: Sz.DRAWER_BUTTON,
    alignItems: "flex-end",
  },
});
