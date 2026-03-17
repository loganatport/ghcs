import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Song } from '../types';

interface SongCardProps {
  song: Song;
  onPress: () => void;
  loading?: boolean;
}

export function SongCard({ song, onPress, loading = false }: SongCardProps) {
  const durationSec = Math.round(song.durationMs / 1000);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={loading}
    >
      {/* Artwork / emoji tile */}
      <View style={[styles.iconBox, { backgroundColor: song.color + '33' }]}>
        {song.artworkUrl ? (
          <Image source={{ uri: song.artworkUrl }} style={styles.artwork} />
        ) : (
          <Text style={styles.emoji}>{song.emoji}</Text>
        )}
      </View>

      {/* Metadata */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{song.artist}</Text>
        <Text style={styles.genre}>{song.genre}</Text>
      </View>

      {/* Right side: loading spinner or duration badge */}
      {loading ? (
        <ActivityIndicator color={song.color} size="small" />
      ) : (
        <View style={[styles.durationBadge, { borderColor: song.color }]}>
          <Text style={[styles.durationText, { color: song.color }]}>
            {durationSec}s
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    gap: 14,
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  artwork: {
    width: 54,
    height: 54,
    borderRadius: 12,
  },
  emoji: {
    fontSize: 28,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  artist: {
    fontSize: 13,
    color: '#aaa',
  },
  genre: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  durationBadge: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
