/**
 * ════════════════════════════════════════════════════════════════
 *  EramixToast — Sistema global de notificaciones
 *  Aparece siempre en la parte superior de la pantalla.
 *  Tipos: ERROR, SUCCESS, WARNING, INFO
 * ════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { EramixColors as C, EramixRadius as R, EramixSpacing as S, EramixShadows as Sh, EramixZIndex as Z } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ── Types ─────────────────────────────────────────────

export type ToastType = "error" | "success" | "warning" | "info";

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  subtitle?: string;
  duration?: number; // ms, default 4000
}

// ── Toast config per type ─────────────────────────────

const TOAST_CONFIG: Record<ToastType, { color: string; icon: React.ComponentProps<typeof Ionicons>["name"] }> = {
  error: { color: C.ERROR_RED, icon: "close-circle" },
  success: { color: C.SUCCESS_GREEN, icon: "checkmark-circle" },
  warning: { color: C.PRIMARY_GOLD, icon: "warning" },
  info: { color: C.INFO_BLUE, icon: "information-circle" },
};

// ── Global toast state (singleton) ────────────────────

type ToastListener = (toast: ToastData | null) => void;
let _listeners: ToastListener[] = [];
let _currentToast: ToastData | null = null;
let _hideTimeout: ReturnType<typeof setTimeout> | null = null;

function notifyListeners(toast: ToastData | null) {
  _currentToast = toast;
  _listeners.forEach((fn) => fn(toast));
}

export const toast = {
  show(data: Omit<ToastData, "id">) {
    if (_hideTimeout) clearTimeout(_hideTimeout);
    const id = Date.now().toString();
    const duration = data.duration ?? 4000;
    const toastData: ToastData = { ...data, id, duration };
    notifyListeners(toastData);
    _hideTimeout = setTimeout(() => {
      notifyListeners(null);
    }, duration);
  },
  error(title: string, subtitle?: string) {
    this.show({ type: "error", title, subtitle });
  },
  success(title: string, subtitle?: string) {
    this.show({ type: "success", title, subtitle });
  },
  warning(title: string, subtitle?: string) {
    this.show({ type: "warning", title, subtitle });
  },
  info(title: string, subtitle?: string) {
    this.show({ type: "info", title, subtitle });
  },
  hide() {
    if (_hideTimeout) clearTimeout(_hideTimeout);
    notifyListeners(null);
  },
  subscribe(listener: ToastListener) {
    _listeners.push(listener);
    return () => {
      _listeners = _listeners.filter((fn) => fn !== listener);
    };
  },
};

// ── Toast Component ───────────────────────────────────

function EramixToastItem({ data, onDismiss }: { data: ToastData; onDismiss: () => void }) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  const config = TOAST_CONFIG[data.type];

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 20, stiffness: 300, mass: 1 });
    opacity.value = withTiming(1, { duration: 200 });
  }, []);

  const handleDismiss = useCallback(() => {
    translateY.value = withTiming(-120, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 });
    setTimeout(() => runOnJS(onDismiss)(), 220);
  }, [onDismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        { top: insets.top + S.SPACE_SM },
        animatedStyle,
      ]}
    >
      <View style={[styles.toastBody, { borderLeftColor: config.color }]}>
        <Ionicons name={config.icon} size={24} color={config.color} style={styles.toastIcon} />
        <View style={styles.toastTextWrap}>
          <Text style={styles.toastTitle} numberOfLines={1}>
            {data.title}
          </Text>
          {data.subtitle ? (
            <Text style={styles.toastSubtitle} numberOfLines={2}>
              {data.subtitle}
            </Text>
          ) : null}
        </View>
        <Pressable onPress={handleDismiss} hitSlop={12} style={styles.toastClose}>
          <Ionicons name="close" size={18} color={C.TEXT_MUTED} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

// ── Provider (mount once at root) ─────────────────────

export function EramixToastProvider() {
  const [current, setCurrent] = React.useState<ToastData | null>(null);

  useEffect(() => {
    return toast.subscribe(setCurrent);
  }, []);

  if (!current) return null;

  return (
    <EramixToastItem
      key={current.id}
      data={current}
      onDismiss={() => toast.hide()}
    />
  );
}

// ── Styles ────────────────────────────────────────────

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    left: S.SPACE_MD,
    right: S.SPACE_MD,
    zIndex: Z.TOAST,
    elevation: 20,
  },
  toastBody: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.NAVY_CARD,
    borderRadius: R.RADIUS_MD,
    borderLeftWidth: 4,
    paddingVertical: S.SPACE_MD,
    paddingHorizontal: S.SPACE_MD,
    ...Sh.SHADOW_LG,
  },
  toastIcon: {
    marginRight: S.SPACE_SM,
  },
  toastTextWrap: {
    flex: 1,
  },
  toastTitle: {
    color: C.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: "600",
  },
  toastSubtitle: {
    color: C.TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: "400",
    marginTop: 2,
  },
  toastClose: {
    marginLeft: S.SPACE_SM,
    padding: S.SPACE_XS,
  },
});

export default EramixToastProvider;
