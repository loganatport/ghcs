import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, MyVideo } from '../types';
import { useLyricSync } from '../hooks/useLyricSync';
import { LyricsOverlay } from '../components/LyricsOverlay';
import { useAppStore } from '../store/useAppStore';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Preview'>;
  route: RouteProp<RootStackParamList, 'Preview'>;
};

export function PreviewScreen({ navigation, route }: Props) {
  const { videoUri, song } = route.params;
  const videoRef = useRef<Video>(null);
  const [positionMs, setPositionMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const addMyVideo = useAppStore((s) => s.addMyVideo);

  const activeIndex = useLyricSync(song.lyrics, positionMs);

  const handlePlaybackUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPositionMs(status.positionMillis ?? 0);
      setIsPlaying(status.isPlaying);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (saved) return;
    setSaving(true);
    try {
      const asset = await MediaLibrary.saveToLibraryAsync(videoUri);
      const myVideo: MyVideo = {
        id: `mv_${Date.now()}`,
        videoUri,
        songId: song.id,
        recordedAt: Date.now(),
      };
      await addMyVideo(myVideo);
      setSaved(true);
      Alert.alert('Saved!', 'Your karaoke video has been saved to your library.');
    } catch {
      Alert.alert('Error', 'Could not save the video.');
    } finally {
      setSaving(false);
    }
  }, [videoUri, song.id, addMyVideo, saved]);

  const handleShare = useCallback(async () => {
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(videoUri, {
          mimeType: 'video/mp4',
          dialogTitle: `My ${song.title} karaoke!`,
        });
      } else {
        await Share.share({
          message: `Check out my ${song.title} karaoke! 🎤`,
          url: videoUri,
        });
      }
    } catch {
      Alert.alert('Error', 'Could not share the video.');
    }
  }, [videoUri, song.title]);

  const handleReRecord = useCallback(() => {
    navigation.replace('Recording', { song });
  }, [navigation, song]);

  return (
    <View style={styles.container}>
      {/* Video */}
      <Video
        ref={videoRef}
        source={{ uri: videoUri }}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        onPlaybackStatusUpdate={handlePlaybackUpdate}
      />

      {/* Lyrics */}
      <LyricsOverlay lines={song.lyrics} activeIndex={activeIndex} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Text style={styles.iconText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.songInfo}>
          <Text style={styles.songEmoji}>{song.emoji}</Text>
          <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
        </View>
        <View style={styles.previewBadge}>
          <Text style={styles.previewText}>PREVIEW</Text>
        </View>
      </View>

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        {/* Re-record */}
        <TouchableOpacity style={styles.actionButton} onPress={handleReRecord}>
          <Text style={styles.actionIcon}>↩</Text>
          <Text style={styles.actionLabel}>Re-record</Text>
        </TouchableOpacity>

        {/* Share (primary) */}
        <TouchableOpacity
          style={[styles.shareButton, { backgroundColor: song.color }]}
          onPress={handleShare}
        >
          <Text style={styles.shareIcon}>📤</Text>
          <Text style={styles.shareText}>Send to Friends</Text>
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity
          style={[styles.actionButton, saved && styles.actionButtonDone]}
          onPress={handleSave}
          disabled={saving || saved}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.actionIcon}>{saved ? '✓' : '⬇'}</Text>
          )}
          <Text style={styles.actionLabel}>{saved ? 'Saved' : 'Save'}</Text>
        </TouchableOpacity>
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
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
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
  previewBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  previewText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 72,
  },
  actionButtonDone: {
    backgroundColor: 'rgba(39,174,96,0.4)',
  },
  actionIcon: {
    fontSize: 22,
    color: '#FFF',
  },
  actionLabel: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
  },
  shareIcon: {
    fontSize: 20,
  },
  shareText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
