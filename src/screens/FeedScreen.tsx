import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ReceivedVideo } from '../types';
import { useAppStore } from '../store/useAppStore';
import { getSongById } from '../data/songs';
import { VideoCard } from '../components/VideoCard';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export function FeedScreen({ navigation }: Props) {
  const { receivedVideos, loadAll, refreshFeed } = useAppStore((s) => ({
    receivedVideos: s.receivedVideos,
    loadAll: s.loadAll,
    refreshFeed: s.refreshFeed,
  }));

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    refreshFeed();
    setTimeout(() => setRefreshing(false), 800);
  }, [refreshFeed]);

  const handlePress = useCallback(
    (video: ReceivedVideo) => {
      const song = getSongById(video.songId);
      if (!song) return;
      navigation.navigate('VideoPlayer', { video, song });
    },
    [navigation]
  );

  const unreadCount = receivedVideos.filter((v) => !v.watched).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            📬 Inbox
            {unreadCount > 0 && (
              <Text style={styles.unreadCount}> {unreadCount} new</Text>
            )}
          </Text>
          <Text style={styles.headerSub}>Karaoke videos from friends</Text>
        </View>
      </View>

      <FlatList
        data={receivedVideos}
        keyExtractor={(v) => v.id}
        renderItem={({ item }) => (
          <VideoCard
            video={item}
            song={getSongById(item.songId)}
            onPress={() => handlePress(item)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FF3B30"
            colors={['#FF3B30']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>No videos yet</Text>
            <Text style={styles.emptyText}>Pull to refresh or ask friends to send you karaoke videos!</Text>
          </View>
        }
        contentContainerStyle={receivedVideos.length === 0 ? { flex: 1 } : { paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  unreadCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B30',
  },
  headerSub: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
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
});
