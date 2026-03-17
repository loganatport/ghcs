import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PermissionGateProps {
  onRequest: () => void;
  requesting: boolean;
}

export function PermissionGate({ onRequest, requesting }: PermissionGateProps) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.emoji}>🎤</Text>
      <Text style={styles.title}>Camera & Mic Access</Text>
      <Text style={styles.description}>
        KaraokeSnap needs access to your{'\n'}camera and microphone to record{'\n'}your amazing karaoke performances!
      </Text>
      <TouchableOpacity
        style={[styles.button, requesting && styles.buttonDisabled]}
        onPress={onRequest}
        disabled={requesting}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {requesting ? 'Requesting...' : 'Grant Access'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#FF3B30',
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
