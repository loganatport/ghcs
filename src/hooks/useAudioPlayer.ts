import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';

export function useAudioPlayer() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [positionMs, setPositionMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  const cleanup = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => {});
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    setIsPlaying(false);
    setPositionMs(0);
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  /**
   * Play an actual audio URL via expo-av (Apple Music 30s preview).
   * positionMs is updated from the native playback status callback.
   */
  const playUrl = useCallback(
    async (url: string, durationMs: number, onFinish?: () => void) => {
      await cleanup();

      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, progressUpdateIntervalMillis: 100 },
      );
      soundRef.current = sound;
      setDuration(durationMs);
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        setPositionMs(status.positionMillis);
        if (status.didJustFinish) {
          setIsPlaying(false);
          onFinish?.();
        }
      });
    },
    [cleanup],
  );

  /**
   * Ticker-based fallback used when there is no preview URL (static songs).
   * Drives positionMs via setInterval so lyrics still sync.
   */
  const playTicker = useCallback(
    (durationMs: number, onFinish?: () => void) => {
      setPositionMs(0);
      setDuration(durationMs);
      setIsPlaying(true);

      const startTime = Date.now();

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setPositionMs(elapsed);
        if (elapsed >= durationMs) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsPlaying(false);
          onFinish?.();
        }
      }, 100);
    },
    [],
  );

  const stop = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => {});
    }
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setPositionMs(0);
    setIsPlaying(false);
  }, []);

  return { positionMs, isPlaying, duration, playUrl, playTicker, stop, reset, cleanup };
}
