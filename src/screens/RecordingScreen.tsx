import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { usePermissions } from '../hooks/usePermissions';
import { useRecording } from '../hooks/useRecording';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useLyricSync } from '../hooks/useLyricSync';
import { LyricsOverlay } from '../components/LyricsOverlay';
import { RecordButton } from '../components/RecordButton';
import { CountdownOverlay } from '../components/CountdownOverlay';
import { PermissionGate } from '../components/PermissionGate';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Recording'>;
  route: RouteProp<RootStackParamList, 'Recording'>;
};

type Phase = 'idle' | 'countdown' | 'recording' | 'stopping';

export function RecordingScreen({ navigation, route }: Props) {
  const { song } = route.params;
  const cameraRef = useRef<CameraView>(null);
  const [phase, setPhase] = useState<Phase>('idle');

  const { allGranted, requesting, requestAll } = usePermissions();
  const { isRecording, startRecording, stopRecording } = useRecording(cameraRef);
  const { positionMs, isPlaying, playUrl, playTicker, stop: stopAudio } = useAudioPlayer();
  const activeIndex = useLyricSync(song.lyrics, positionMs);

  // Start recording after countdown completes
  const handleCountdownComplete = useCallback(async () => {
    setPhase('recording');
    // Play real preview audio if available, otherwise drive lyrics with a ticker
    const onAudioEnd = () => handleStop();
    if (song.previewUrl) {
      playUrl(song.previewUrl, song.durationMs, onAudioEnd);
    } else {
      playTicker(song.durationMs, onAudioEnd);
    }
    const uri = await startRecording();
    if (uri) {
      // Recording completed (stopped manually or hit maxDuration)
      await stopAudio();
      navigation.replace('Preview', { videoUri: uri, song });
    } else {
      setPhase('idle');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song, startRecording, stopAudio, navigation, playUrl, playTicker]);

  const handleToggle = useCallback(() => {
    if (phase === 'idle') {
      setPhase('countdown');
    } else if (phase === 'recording') {
      handleStop();
    }
  }, [phase]);

  const handleStop = useCallback(() => {
    if (phase !== 'recording') return;
    setPhase('stopping');
    stopRecording();
    stopAudio();
  }, [phase, stopRecording, stopAudio]);

  const handleClose = useCallback(() => {
    if (isRecording) {
      Alert.alert('Stop Recording?', 'Your current recording will be discarded.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Stop', style: 'destructive', onPress: () => {
          stopRecording();
          stopAudio();
          navigation.goBack();
        }},
      ]);
    } else {
      navigation.goBack();
    }
  }, [isRecording, stopRecording, stopAudio, navigation]);

  if (!allGranted) {
    return <PermissionGate onRequest={requestAll} requesting={requesting} />;
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="front"
        mode="video"
      />

      {/* Countdown overlay */}
      {phase === 'countdown' && (
        <CountdownOverlay onComplete={handleCountdownComplete} />
      )}

      {/* Lyrics */}
      {phase === 'recording' && (
        <LyricsOverlay lines={song.lyrics} activeIndex={activeIndex} />
      )}

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <View style={styles.songInfo}>
          <Text style={styles.songEmoji}>{song.emoji}</Text>
          <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
        </View>
        {phase === 'recording' && (
          <View style={styles.recBadge}>
            <View style={styles.recDot} />
            <Text style={styles.recText}>REC</Text>
          </View>
        )}
      </View>

      {/* Timer bar */}
      {phase === 'recording' && (
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min((positionMs / song.durationMs) * 100, 100)}%`,
                backgroundColor: song.color,
              },
            ]}
          />
        </View>
      )}

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        {phase === 'idle' && (
          <Text style={styles.hint}>Tap to start • Sing along with the lyrics!</Text>
        )}
        {phase === 'recording' && (
          <Text style={styles.hint}>Tap to stop recording</Text>
        )}
        {phase === 'stopping' && (
          <Text style={styles.hint}>Processing...</Text>
        )}
        <RecordButton
          isRecording={phase === 'recording'}
          onPress={handleToggle}
          disabled={phase === 'countdown' || phase === 'stopping'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topBar: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  songInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  songEmoji: {
    fontSize: 18,
  },
  songTitle: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  recText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 16,
  },
  hint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
});
