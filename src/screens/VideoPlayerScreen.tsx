import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useLyricSync } from '../hooks/useLyricSync';
import { LyricsOverlay } from '../components/LyricsOverlay';
import { useAppStore } from '../store/useAppStore';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VideoPlayer'>;
  route: RouteProp<RootStackParamList, 'VideoPlayer'>;
};

export function VideoPlayerScreen({ navigation, route }: Props) {
  const { video, song } = route.params;
  const videoRef = useRef<Video>(null);
  const [positionMs, setPositionMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const markWatched = useAppStore((s) => s.markWatched);

  const activeIndex = useLyricSync(song.lyrics, positionMs);

  useEffect(() => {
    markWatched(video.id);
  }, [video.id, markWatched]);

  const handlePlaybackUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPositionMs(status.positionMillis ?? 0);
      setIsPlaying(status.isPlaying);
    }
  }, []);

  const togglePlay = useCallback(async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  }, [isPlaying]);

  // Since mock videos don't have a real URI, show a placeholder view
  const hasVideo = !!video.videoUri;

  return (
    <View style={styles.container}>
      {hasVideo ? (
        <Video
          ref={videoRef}
          source={{ uri: video.videoUri! }}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          onPlaybackStatusUpdate={handlePlaybackUpdate}
        />
      ) : (
        // Placeholder for mock videos
        <MockVideoPlaceholder song={song} sender={video.sender} positionMs={positionMs} />
      )}

      {/* Lyrics overlay */}
      <LyricsOverlay lines={song.lyrics} activeIndex={activeIndex} />

      {/* Top bar */}
      <SafeAreaView style={styles.topBar} edges={['top']}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.senderInfo}>
          <View style={[styles.miniAvatar, { backgroundColor: video.sender.avatarColor }]}>
            <Text style={styles.miniAvatarText}>{video.sender.initials}</Text>
          </View>
          <View>
            <Text style={styles.senderName}>{video.sender.username}</Text>
            <Text style={styles.songName}>{song.emoji} {song.title}</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Tap to play/pause */}
      {hasVideo && (
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={togglePlay} activeOpacity={1}>
          {!isPlaying && (
            <View style={styles.pausedOverlay}>
              <View style={styles.playCircle}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

function MockVideoPlaceholder({
  song,
  sender,
  positionMs,
}: {
  song: any;
  sender: any;
  positionMs: number;
}) {
  // Animate background color based on positionMs for a fun visual
  const hue = (positionMs / 500) % 360;

  return (
    <View style={[mockStyles.container, { backgroundColor: song.color + '22' }]}>
      <View style={[mockStyles.avatar, { backgroundColor: sender.avatarColor }]}>
        <Text style={mockStyles.avatarText}>{sender.initials}</Text>
      </View>
      <Text style={mockStyles.emoji}>{song.emoji}</Text>
      <Text style={mockStyles.title}>{song.title}</Text>
      <Text style={mockStyles.artist}>by {song.artist}</Text>
      <Text style={mockStyles.hint}>🎤 Mock video preview</Text>
    </View>
  );
}

const mockStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
  },
  artist: {
    fontSize: 14,
    color: '#aaa',
  },
  hint: {
    fontSize: 12,
    color: '#555',
    marginTop: 12,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  miniAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  senderName: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  songName: {
    color: '#aaa',
    fontSize: 12,
  },
  pausedOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  playCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#FFF',
    fontSize: 28,
    marginLeft: 4,
  },
});
