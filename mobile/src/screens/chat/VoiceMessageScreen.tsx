/**
 * ════════════════════════════════════════════════════
 *  V.2 · Voice Messages — Record & Send Audio
 *  European Glass DS · Animated waveform · Gold accent
 * ════════════════════════════════════════════════════
 */
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  FadeIn,
  FadeOut,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { typography, colors, DS } from "@/design-system/tokens";

import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { sendVoiceMessage } from "@/api/chat";
import type { ChatStackParamList } from "@/types/chat";

const WAVE_BARS = 32;
const MAX_DURATION_SEC = 120;

export default function VoiceMessageScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ChatStackParamList, "VoiceMessage">>();
  const [isSending, setIsSending] = useState(false);

  const { isRecording, duration, startRecording, stopRecording } = useAudioRecorder();
  const [waveData, setWaveData] = useState<number[]>(
    Array(WAVE_BARS).fill(0.15)
  );
  
  const waveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Pulse animation for rec button ──
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isRecording) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        true
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 600 }),
          withTiming(0.3, { duration: 600 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isRecording]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Fake wave logic for visual effect since we just have full expo-av without metering
  const startWaves = useCallback(() => {
    waveTimerRef.current = setInterval(() => {
      setWaveData((prev) =>
        prev.map(() => 0.15 + Math.random() * 0.85)
      );
    }, 150);
  }, []);

  const stopWaves = useCallback(() => {
    if (waveTimerRef.current) {
      clearInterval(waveTimerRef.current);
      waveTimerRef.current = null;
    }
  }, []);

  const handleStart = useCallback(async () => {
    await startRecording();
    startWaves();
  }, [startRecording, startWaves]);

  const cancelRecording = useCallback(async () => {
    await stopRecording();
    stopWaves();
    setWaveData(Array(WAVE_BARS).fill(0.15));
  }, [stopRecording, stopWaves]);

  const sendVoice = useCallback(async () => {
    if (duration < 1) {
      Alert.alert("Muy corto", "Graba al menos 1 segundo");
      return;
    }
    stopWaves();
    const uri = await stopRecording();
    
    if (!uri) {
      Alert.alert("Error", "No se pudo obtener el audio");
      return;
    }

    try {
      setIsSending(true);
      await sendVoiceMessage(route.params.conversationId, uri);
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo subir la nota de voz");
      setIsSending(false);
    }
  }, [duration, stopWaves, stopRecording, route.params.conversationId, navigation]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[DS.background, "#0E1A35", "#0A1628"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} disabled={isSending}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Mensaje de Voz</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Waveform Visualization */}
      <View style={styles.waveContainer}>
        <View style={styles.barsArea}>
          {waveData.map((amplitude, i) => (
            <Animated.View
              key={i}
              entering={FadeIn.delay(i * 20)}
              style={[
                styles.waveBar,
                {
                  height: interpolate(
                    amplitude,
                    [0, 1],
                    [6, 80],
                    Extrapolation.CLAMP
                  ),
                  backgroundColor:
                    isRecording
                      ? interpolateColorAnimated(amplitude)
                      : "rgba(255,255,255,0.12)",
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        {isRecording && (
          <Animated.View entering={FadeIn} style={styles.recDot} />
        )}
        <Text style={styles.timer}>{formatTime(duration)}</Text>
        <Text style={styles.maxDuration}>
          / {formatTime(MAX_DURATION_SEC)}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Cancel */}
        <Pressable
          style={styles.sideBtn}
          onPress={cancelRecording}
          disabled={!isRecording || isSending}
        >
          {isRecording && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <Ionicons name="trash-outline" size={24} color="#fff" />
              <Text style={styles.sideLabel}>Borrar</Text>
            </Animated.View>
          )}
        </Pressable>

        {/* Main REC */}
        <View style={styles.centerControl}>
          <Animated.View style={[styles.glowRing, glowStyle]} />
          <Animated.View style={[styles.pulseRing, pulseStyle]} />

          {isSending ? (
            <View style={styles.recBtn}>
              <ActivityIndicator color="#000" />
            </View>
          ) : isRecording ? (
            <Pressable style={[styles.recBtn, styles.recBtnActive]} onPress={cancelRecording}>
              <Ionicons name="stop" size={28} color="#000" />
            </Pressable>
          ) : (
            <Pressable style={styles.recBtn} onPress={handleStart}>
              <Ionicons name="mic" size={32} color="#000" />
            </Pressable>
          )}
        </View>

        {/* Send */}
        <Pressable
          style={styles.sideBtn}
          onPress={sendVoice}
          disabled={!isRecording || duration < 1 || isSending}
        >
          {isRecording && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <View style={styles.sendIconWrapper}>
                <Ionicons name="arrow-up" size={20} color="#000" />
              </View>
              <Text style={styles.sideLabel}>Enviar</Text>
            </Animated.View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function interpolateColorAnimated(amplitude: number) {
  "worklet";
  if (amplitude > 0.7) {
    return "rgba(255, 204, 0, 1)";
  } else if (amplitude > 0.4) {
    return "rgba(255, 204, 0, 0.6)";
  }
  return "rgba(255, 255, 255, 0.4)";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontFamily: typography.families.subheading,
  },
  waveContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  barsArea: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 80,
  },
  waveBar: {
    width: 4,
    borderRadius: 4,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    marginRight: 8,
  },
  timer: {
    color: "#fff",
    fontSize: 28,
    fontFamily: typography.families.bodyMedium,
  },
  maxDuration: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 16,
    fontFamily: typography.families.bodyMedium,
    marginLeft: 8,
    marginTop: 6,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    height: 160,
    paddingBottom: 40,
  },
  sideBtn: {
    width: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  sideLabel: {
    color: "#fff",
    fontSize: 12,
    fontFamily: typography.families.bodyMedium,
    marginTop: 8,
    opacity: 0.8,
  },
  centerControl: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
  },
  recBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: DS.primary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 10,
  },
  recBtnActive: {
    backgroundColor: "#FF3B30",
  },
  pulseRing: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: DS.primary,
    zIndex: 5,
  },
  glowRing: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 204, 0, 0.15)",
    zIndex: 0,
  },
  sendIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
