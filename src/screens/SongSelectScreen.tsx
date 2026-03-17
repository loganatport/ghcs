import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Song } from '../types';
import { SONGS } from '../data/songs';
import { SongCard } from '../components/SongCard';
import { searchAppleMusic, toSong, AppleMusicSong } from '../services/appleMusicApi';
import { fetchLyrics } from '../services/lrclibApi';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export function SongSelectScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AppleMusicSong[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [loadingSongId, setLoadingSongId] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    setSearchError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchAppleMusic(text);
        setSearchResults(results);
      } catch (e: any) {
        setSearchError(e.message ?? 'Search failed');
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, []);

  /** Tap on an Apple Music result: fetch lyrics then navigate. */
  const handleSelectApple = useCallback(
    async (am: AppleMusicSong) => {
      setLoadingSongId(am.amId);
      try {
        const lyrics = await fetchLyrics(
          am.title,
          am.artist,
          am.album,
          am.durationMs,
        );
        const song = toSong(am, lyrics);
        navigation.navigate('Recording', { song });
      } catch {
        // If lyrics fetch fails, proceed without them
        const song = toSong(am, []);
        navigation.navigate('Recording', { song });
      } finally {
        setLoadingSongId(null);
      }
    },
    [navigation],
  );

  /** Tap on a static (built-in) song. */
  const handleSelectStatic = useCallback(
    (song: Song) => {
      navigation.navigate('Recording', { song });
    },
    [navigation],
  );

  const isSearchMode = query.trim().length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎵 Pick a Song</Text>
        <Text style={styles.headerSub}>
          {isSearchMode ? 'Apple Music catalog' : 'Tap to start recording'}
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Apple Music..."
          placeholderTextColor="#555"
          value={query}
          onChangeText={handleQueryChange}
          clearButtonMode="while-editing"
          returnKeyType="search"
          autoCorrect={false}
        />
        {searching && (
          <ActivityIndicator style={styles.searchSpinner} color="#FF3B30" size="small" />
        )}
      </View>

      {/* Error banner */}
      {searchError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{searchError}</Text>
        </View>
      )}

      {/* Results or default list */}
      {isSearchMode ? (
        <FlatList
          data={searchResults}
          keyExtractor={(am) => am.amId}
          renderItem={({ item: am }) => (
            <SongCard
              song={{
                id: am.amId,
                title: am.title,
                artist: am.artist,
                durationMs: Math.min(am.durationMs, 30_000),
                genre: am.genre,
                emoji: '🎵',
                color: am.color,
                artworkUrl: am.artworkUrl ?? undefined,
                lyrics: [],
              }}
              onPress={() => handleSelectApple(am)}
              loading={loadingSongId === am.amId}
            />
          )}
          ListEmptyComponent={
            !searching ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchError ? 'Search unavailable' : 'No results found'}
                </Text>
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      ) : (
        <FlatList
          data={SONGS}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => (
            <SongCard song={item} onPress={() => handleSelectStatic(item)} />
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}

      {/* Token setup hint (only shown when token is not configured) */}
      {searchError?.includes('not configured') && (
        <View style={styles.setupHint}>
          <Text style={styles.setupHintText}>
            Add your Apple Music developer token to{' '}
            <Text style={styles.setupHintCode}>src/config/appleMusic.ts</Text>{' '}
            or set the{' '}
            <Text style={styles.setupHintCode}>EXPO_PUBLIC_APPLE_MUSIC_TOKEN</Text>{' '}
            env var.
          </Text>
        </View>
      )}
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
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontSize: 15,
    color: '#FFF',
  },
  searchSpinner: {
    marginLeft: 12,
  },
  errorBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#3a1010',
    borderRadius: 10,
    padding: 10,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#555',
    fontSize: 16,
  },
  setupHint: {
    margin: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 14,
  },
  setupHintText: {
    color: '#888',
    fontSize: 13,
    lineHeight: 20,
  },
  setupHintCode: {
    color: '#FF9F43',
    fontFamily: 'monospace',
  },
});
