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
   * Play a tone-based "metronome" karaoke click track since we don't have
   * actual MP3 assets bundled. In a real app, pass audioAsset to Audio.Sound.createAsync().
   *
   * We use a simple interval ticker to drive positionMs so lyrics still sync.
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
    []
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

  return { positionMs, isPlaying, duration, playTicker, stop, reset, cleanup };
}
