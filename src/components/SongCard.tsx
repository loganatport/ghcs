import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Song } from '../types';

interface SongCardProps {
  song: Song;
  onPress: () => void;
}

export function SongCard({ song, onPress }: SongCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.iconBox, { backgroundColor: song.color + '33' }]}>
        <Text style={styles.emoji}>{song.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{song.artist}</Text>
        <Text style={styles.genre}>{song.genre}</Text>
      </View>
      <View style={[styles.durationBadge, { borderColor: song.color }]}>
        <Text style={[styles.durationText, { color: song.color }]}>60s</Text>
      </View>
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
