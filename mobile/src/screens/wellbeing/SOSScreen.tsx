/**
 * ────────────────────────────────────────────────────────
 *  SOSScreen — Pantalla de emergencia
 * ────────────────────────────────────────────────────────
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Vibration,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import {
  colors,
  typography,
  spacing,
  radii,
} from "@/design-system/tokens";
import { wellbeingApi } from "@/api/wellbeingService";
// import { sosHero } from "@/assets/images";

export default function SOSScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [activated, setActivated] = useState(false);

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.4);

  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.6, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
    pulseOpacity.value = withRepeat(
      withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const sosMutation = useMutation({
    mutationFn: () => wellbeingApi.activateSOS("MANUAL", "ES"),
    onSuccess: (data) => {
      setActivated(true);
      Vibration.vibrate([0, 200, 100, 200]);
      Alert.alert(
        "SOS Activado",
        `Se ha notificado a ${data.contactsNotified} contactos de emergencia`,
      );
    },
    onError: () => {
      Alert.alert("Error", "No se pudo activar el SOS. Llama al 112 directamente.");
    },
  });

  const handleActivateSOS = () => {
    Alert.alert(
      "⚠️ Activar SOS",
      "Se notificará a todos tus contactos de emergencia con tu ubicación actual. ¿Continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "ACTIVAR SOS",
          style: "destructive",
          onPress: () => sosMutation.mutate(),
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#1A0010", "#2A0015", "#06081A"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: insets.top + spacing.md }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>SOS</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Hero Image */}
        <View style={styles.heroBanner}>
          {/* Hero image placeholder */}
        </View>

        {/* Main SOS Button */}
        <View style={styles.sosCenter}>
          <Animated.View style={[styles.pulse, pulseStyle]} />
          <Animated.View style={[styles.pulseInner, pulseStyle]} />

          <Pressable
            style={[styles.sosBtn, activated && styles.sosBtnActivated]}
            onPress={handleActivateSOS}
            disabled={sosMutation.isPending || activated}
          >
            <LinearGradient
              colors={activated ? ["#00D68F", "#00BFA6"] : ["#FF4F6F", "#FF2D87"]}
              style={styles.sosBtnGradient}
            >
              <Ionicons
                name={activated ? "checkmark-circle" : "alert-circle"}
                size={56}
                color="#FFF"
              />
              <Text style={styles.sosBtnText}>
                {activated ? "SOS Activado" : sosMutation.isPending ? "Activando..." : "SOS"}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>
            {activated
              ? "Tus contactos han sido notificados"
              : "Pulsa el botón si necesitas ayuda urgente"}
          </Text>
          <Text style={styles.infoText}>
            {activated
              ? "Mantén la calma. Si es una emergencia médica, llama al 112."
              : "Se enviará una alerta con tu ubicación a todos tus contactos de emergencia registrados."}
          </Text>
        </View>

        {/* Emergency Call */}
        <Pressable style={styles.callBtn}>
          <Ionicons name="call" size={22} color={colors.status.success} />
          <Text style={styles.callBtnText}>Llamar al 112</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h2.fontSize,
    color: "#FF4F6F",
  },

  // SOS Center
  sosCenter: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  pulse: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 79, 111, 0.15)",
  },
  pulseInner: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(255, 79, 111, 0.08)",
  },
  sosBtn: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: "hidden",
  },
  sosBtnActivated: {},
  sosBtnGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  sosBtnText: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    color: "#FFF",
    letterSpacing: 2,
  },

  // Info
  infoSection: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  infoTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h4.fontSize,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  infoText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },

  // Call
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: "rgba(0, 214, 143, 0.10)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0, 214, 143, 0.25)",
    marginBottom: spacing.xxl,
  },
  callBtnText: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.status.success,
  },

  // Hero
  heroBanner: {
    width: "100%",
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radii.lg,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  heroImage: {
    width: "60%",
    height: "100%",
  },
});
