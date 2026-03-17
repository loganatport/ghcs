import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ReceivedVideo, Song } from '../types';

interface VideoCardProps {
  video: ReceivedVideo;
  song: Song | undefined;
  onPress: () => void;
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function VideoCard({ video, song, onPress }: VideoCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.75}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: video.sender.avatarColor }]}>
        <Text style={styles.avatarText}>{video.sender.initials}</Text>
        {!video.watched && <View style={styles.unreadDot} />}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.username}>{video.sender.username}</Text>
        <Text style={styles.songName} numberOfLines={1}>
          {song ? `${song.emoji} ${song.title}` : 'Unknown song'}
        </Text>
        <Text style={styles.time}>{timeAgo(video.sentAt)}</Text>
      </View>

      {/* Play icon */}
      <View style={[styles.playButton, { backgroundColor: song?.color ?? '#555' }]}>
        <Text style={styles.playIcon}>▶</Text>
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
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#0d0d0d',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  username: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  songName: {
    fontSize: 13,
    color: '#aaa',
  },
  time: {
    fontSize: 11,
    color: '#555',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: 2,
  },
});
