import { useState, useEffect, useCallback } from 'react';
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export interface PermissionStatus {
  camera: boolean;
  microphone: boolean;
  mediaLibrary: boolean;
  allGranted: boolean;
  requesting: boolean;
}

export function usePermissions() {
  const [cameraPermission, requestCamera] = useCameraPermissions();
  const [micPermission, requestMic] = useMicrophonePermissions();
  const [mediaPermission, requestMedia] = MediaLibrary.usePermissions();
  const [requesting, setRequesting] = useState(false);

  const camera = cameraPermission?.granted ?? false;
  const microphone = micPermission?.granted ?? false;
  const mediaLibrary = mediaPermission?.granted ?? false;
  const allGranted = camera && microphone && mediaLibrary;

  const requestAll = useCallback(async () => {
    setRequesting(true);
    try {
      await Promise.all([
        !camera && requestCamera(),
        !microphone && requestMic(),
        !mediaLibrary && requestMedia(),
      ]);
    } finally {
      setRequesting(false);
    }
  }, [camera, microphone, mediaLibrary, requestCamera, requestMic, requestMedia]);

  return { camera, microphone, mediaLibrary, allGranted, requesting, requestAll };
}
