/**
 * useAudioRecorder — Real audio recording with expo-av
 *
 * Usage:
 *   const { isRecording, duration, startRecording, stopRecording } = useAudioRecorder();
 *   const uri = await stopRecording();  // returns local file URI or null on error
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";

export interface AudioRecorderState {
  isRecording: boolean;
  /** Recording duration in seconds */
  duration: number;
  startRecording: () => Promise<void>;
  /** Returns the local URI of the recording, or null if no recording */
  stopRecording: () => Promise<string | null>;
}

export function useAudioRecorder(): AudioRecorderState {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch {
      // If permissions denied or device error, silently fail
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (!recordingRef.current) return null;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsRecording(false);
      setDuration(0);
      return uri ?? null;
    } catch {
      recordingRef.current = null;
      setIsRecording(false);
      setDuration(0);
      return null;
    }
  }, []);

  return { isRecording, duration, startRecording, stopRecording };
}
