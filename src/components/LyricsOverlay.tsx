import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { LyricLine } from '../types';

interface LyricsOverlayProps {
  lines: LyricLine[];
  activeIndex: number;
  style?: ViewStyle;
}

export function LyricsOverlay({ lines, activeIndex, style }: LyricsOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const prevIndex = useRef(activeIndex);

  useEffect(() => {
    if (prevIndex.current !== activeIndex) {
      prevIndex.current = activeIndex;
      // Pulse animation on line change
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.3, duration: 80, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [activeIndex, fadeAnim]);

  const prevLine  = activeIndex > 0 ? lines[activeIndex - 1] : null;
  const activeLine = activeIndex >= 0 ? lines[activeIndex] : null;
  const nextLine  = activeIndex >= 0 && activeIndex < lines.length - 1 ? lines[activeIndex + 1] : null;

  if (!activeLine && !nextLine) return null;

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {prevLine?.text ? (
        <Text style={styles.adjacentText} numberOfLines={1}>
          {prevLine.text}
        </Text>
      ) : <View style={styles.placeholder} />}

      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.activeBackground}>
          <Text style={styles.activeText} numberOfLines={2}>
            {activeLine?.text ?? ''}
          </Text>
        </View>
      </Animated.View>

      {nextLine?.text ? (
        <Text style={styles.adjacentText} numberOfLines={1}>
          {nextLine.text}
        </Text>
      ) : <View style={styles.placeholder} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  placeholder: {
    height: 26,
  },
  activeBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 6,
    alignItems: 'center',
  },
  activeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 0.4,
  },
  adjacentText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
