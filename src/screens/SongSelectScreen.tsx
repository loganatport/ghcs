import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Song } from '../types';
import { SONGS } from '../data/songs';
import { SongCard } from '../components/SongCard';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const GENRES = ['All', 'Rock', 'Pop', 'Funk/Pop', 'Soul/Pop', 'Pop/Disco'];

export function SongSelectScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const filtered = useMemo(() => {
    return SONGS.filter((s) => {
      const matchesQuery =
        query.length === 0 ||
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.artist.toLowerCase().includes(query.toLowerCase());
      const matchesGenre = selectedGenre === 'All' || s.genre === selectedGenre;
      return matchesQuery && matchesGenre;
    });
  }, [query, selectedGenre]);

  const handleSelect = (song: Song) => {
    navigation.navigate('Recording', { song });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎵 Pick a Song</Text>
        <Text style={styles.headerSub}>Tap to start recording</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs or artists..."
          placeholderTextColor="#555"
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Genre filter */}
      <FlatList
        data={GENRES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(g) => g}
        contentContainerStyle={styles.genreList}
        renderItem={({ item: genre }) => (
          <TouchableOpacity
            style={[
              styles.genrePill,
              selectedGenre === genre && styles.genrePillActive,
            ]}
            onPress={() => setSelectedGenre(genre)}
          >
            <Text
              style={[
                styles.genrePillText,
                selectedGenre === genre && styles.genrePillTextActive,
              ]}
            >
              {genre}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Songs list */}
      <FlatList
        data={filtered}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <SongCard song={item} onPress={() => handleSelect(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No songs found</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
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
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontSize: 15,
    color: '#FFF',
  },
  genreList: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  genrePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  genrePillActive: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  genrePillText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },
  genrePillTextActive: {
    color: '#FFF',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#555',
    fontSize: 16,
  },
});
