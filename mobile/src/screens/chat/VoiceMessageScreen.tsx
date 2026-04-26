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
import { DS } from "@/design-system/tokens";

const WAVE_BARS = 32;
const MAX_DURATION_SEC = 120;

export default function VoiceMessageScreen() {
  const navigation = useNavigation();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [waveData, setWaveData] = useState<number[]>(
    Array(WAVE_BARS).fill(0.15)
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Pulse animation for rec button ──
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isRecording && !isPaused) {
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
  }, [isRecording, isPaused]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // ── Timer logic ──
  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev >= MAX_DURATION_SEC) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
      // Simulate waveform
      setWaveData((prev) =>
        prev.map(() => 0.15 + Math.random() * 0.85)
      );
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setIsPaused(false);
    setSeconds(0);
    startTimer();
  }, [startTimer]);

  const pauseRecording = useCallback(() => {
    setIsPaused(true);
    stopTimer();
  }, [stopTimer]);

  const resumeRecording = useCallback(() => {
    setIsPaused(false);
    startTimer();
  }, [startTimer]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setIsPaused(false);
    stopTimer();
  }, [stopTimer]);

  const sendVoice = useCallback(() => {
    if (seconds < 1) {
      Alert.alert("Muy corto", "Graba al menos 1 segundo");
      return;
    }
    // TODO: Upload audio blob via chat API
    Alert.alert("✅ Enviado", `Mensaje de voz (${formatTime(seconds)}) enviado`);
    navigation.goBack();
  }, [seconds, navigation]);

  const cancelRecording = useCallback(() => {
    stopRecording();
    setSeconds(0);
    setWaveData(Array(WAVE_BARS).fill(0.15));
  }, [stopRecording]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[DS.background, "#0E1A35", "#0A1628"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Mensaje de Voz</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Waveform Visualization */}
      <View style={styles.waveContainer}>
        <View style={styles.waveInner}>
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
                    isRecording && !isPaused
                      ? interpolateColor(amplitude)
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
        <Text style={styles.timer}>{formatTime(seconds)}</Text>
        <Text style={styles.maxDuration}>
          / {formatTime(MAX_DURATION_SEC)}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsRow}>
        {/* Cancel */}
        <Pressable
          onPress={isRecording ? cancelRecording : () => navigation.goBack()}
          style={styles.secondaryBtn}
        >
          <Ionicons name="trash-outline" size={24} color="#FC8181" />
          <Text style={styles.secondaryLabel}>Cancelar</Text>
        </Pressable>

        {/* Record / Pause */}
        <View style={styles.mainBtnWrapper}>
          <Animated.View style={[styles.recGlow, glowStyle]} />
          <Animated.View style={pulseStyle}>
            <Pressable
              onPress={() => {
                if (!isRecording) startRecording();
                else if (isPaused) resumeRecording();
                else pauseRecording();
              }}
              style={[
                styles.mainBtn,
                isRecording && !isPaused && styles.mainBtnRecording,
              ]}
            >
              <Ionicons
                name={
                  !isRecording
                    ? "mic"
                    : isPaused
                    ? "play"
                    : "pause"
                }
                size={32}
                color="#fff"
              />
            </Pressable>
          </Animated.View>
        </View>

        {/* Send */}
        <Pressable
          onPress={sendVoice}
          style={[
            styles.secondaryBtn,
            seconds < 1 && { opacity: 0.3 },
          ]}
          disabled={seconds < 1}
        >
          <Ionicons name="send" size={24} color={DS.primary} />
          <Text style={[styles.secondaryLabel, { color: DS.primary }]}>
            Enviar
          </Text>
        </Pressable>
      </View>

      {/* Tips */}
      <View style={styles.tipContainer}>
        <Ionicons name="information-circle-outline" size={16} color={DS.textMuted} />
        <Text style={styles.tipText}>
          Mantén un tono normal · Máximo 2 min · Se envía como audio
        </Text>
      </View>
    </View>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function interpolateColor(amplitude: number): string {
  if (amplitude > 0.7) return "#FFD700";
  if (amplitude > 0.4) return "#FF6D3F";
  return "rgba(255,215,0,0.5)";
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },

  waveContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  waveInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    height: 100,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    minHeight: 6,
  },

  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 24,
  },
  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E53E3E",
    marginRight: 10,
  },
  timer: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "300",
    fontVariant: ["tabular-nums"],
  },
  maxDuration: {
    color: DS.textMuted,
    fontSize: 16,
    marginLeft: 6,
    marginTop: 10,
  },

  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 32,
    paddingBottom: 30,
  },
  secondaryBtn: { alignItems: "center", gap: 4 },
  secondaryLabel: { color: DS.textSecondary, fontSize: 11 },

  mainBtnWrapper: { alignItems: "center", justifyContent: "center" },
  recGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,215,0,0.25)",
  },
  mainBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: DS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  mainBtnRecording: {
    backgroundColor: "#E53E3E",
  },

  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
    gap: 6,
  },
  tipText: { color: DS.textMuted, fontSize: 11 },
});
