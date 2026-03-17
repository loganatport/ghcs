import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppStore } from '../store/useAppStore';
import { getSongById } from '../data/songs';
import { RootStackParamList, MyVideo, ReceivedVideo } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - 48) / 3;

function VideoTile({ video, onPress }: { video: MyVideo; onPress: () => void }) {
  const song = getSongById(video.songId);
  const date = new Date(video.recordedAt);
  const label = `${date.getMonth() + 1}/${date.getDate()}`;

  return (
    <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.tileBackground, { backgroundColor: (song?.color ?? '#333') + '55' }]}>
        <Text style={styles.tileEmoji}>{song?.emoji ?? '🎤'}</Text>
        <Text style={styles.tileDate}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function ProfileScreen({ navigation }: Props) {
  const { username, myVideos, setUsername } = useAppStore((s) => ({
    username: s.username,
    myVideos: s.myVideos,
    setUsername: s.setUsername,
  }));
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(username);

  const handleSaveName = useCallback(async () => {
    const trimmed = draftName.trim();
    if (!trimmed) {
      setDraftName(username);
      setEditingName(false);
      return;
    }
    await setUsername(trimmed);
    setEditingName(false);
  }, [draftName, username, setUsername]);

  const handleTilePress = useCallback(
    (video: MyVideo) => {
      const song = getSongById(video.songId);
      if (!song) return;
      // Reuse VideoPlayer with a mock ReceivedVideo wrapper
      const mockReceived: ReceivedVideo = {
        id: video.id,
        sender: { id: 'me', username, avatarColor: '#FF3B30', initials: 'ME' },
        songId: video.songId,
        sentAt: video.recordedAt,
        watched: true,
        videoUri: video.videoUri,
      };
      navigation.navigate('VideoPlayer', { video: mockReceived, song });
    },
    [navigation, username]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>🎤</Text>
        </View>
        <View style={styles.profileInfo}>
          {editingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={styles.nameInput}
                value={draftName}
                onChangeText={setDraftName}
                autoFocus
                onSubmitEditing={handleSaveName}
                returnKeyType="done"
                maxLength={24}
              />
              <TouchableOpacity onPress={handleSaveName} style={styles.saveNameBtn}>
                <Text style={styles.saveNameText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => { setDraftName(username); setEditingName(true); }}>
              <Text style={styles.username}>{username} <Text style={styles.editHint}>✎</Text></Text>
            </TouchableOpacity>
          )}
          <Text style={styles.videoCount}>{myVideos.length} karaoke video{myVideos.length !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      {/* My videos grid */}
      <Text style={styles.sectionTitle}>My Recordings</Text>
      {myVideos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎬</Text>
          <Text style={styles.emptyTitle}>No recordings yet</Text>
          <Text style={styles.emptyText}>Go to the Songs tab and record your first karaoke video!</Text>
          <TouchableOpacity
            style={styles.cta}
            onPress={() => (navigation as any).navigate('Songs')}
          >
            <Text style={styles.ctaText}>🎵 Pick a Song</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={myVideos}
          keyExtractor={(v) => v.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <VideoTile video={item} onPress={() => handleTilePress(item)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  avatarLargeText: {
    fontSize: 36,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  username: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
  },
  editHint: {
    fontSize: 14,
    color: '#555',
  },
  videoCount: {
    fontSize: 13,
    color: '#666',
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  saveNameBtn: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  saveNameText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#888',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 4,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    margin: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tileBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  tileEmoji: {
    fontSize: 28,
  },
  tileDate: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  cta: {
    marginTop: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  ctaText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
