import { useState, useRef, useCallback } from 'react';
import { CameraView } from 'expo-camera';

export function useRecording(cameraRef: React.RefObject<CameraView>) {
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  const startRecording = useCallback(async (): Promise<string | null> => {
    if (!cameraRef.current || isRecording) return null;
    setIsRecording(true);
    setVideoUri(null);
    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: 65 });
      const uri = video?.uri ?? null;
      setVideoUri(uri);
      setIsRecording(false);
      return uri;
    } catch {
      setIsRecording(false);
      return null;
    }
  }, [cameraRef, isRecording]);

  const stopRecording = useCallback(() => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  }, [cameraRef, isRecording]);

  const reset = useCallback(() => {
    setIsRecording(false);
    setVideoUri(null);
  }, []);

  return { isRecording, videoUri, startRecording, stopRecording, reset };
}
