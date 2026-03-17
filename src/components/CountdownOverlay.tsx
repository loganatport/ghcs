import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface CountdownOverlayProps {
  onComplete: () => void;
}

export function CountdownOverlay({ onComplete }: CountdownOverlayProps) {
  const [count, setCount] = useState(3);
  const scaleAnim = useRef(new Animated.Value(0.4)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = () => {
      scaleAnim.setValue(0.4);
      opacityAnim.setValue(1);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1.4, useNativeDriver: true, friction: 3 }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 800, useNativeDriver: true, delay: 200 }),
      ]).start();
    };

    pulse();
    const timer = setInterval(() => {
      setCount((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(timer);
          setTimeout(onComplete, 300);
          return 0;
        }
        pulse();
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (count === 0) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.Text
        style={[
          styles.number,
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        ]}
      >
        {count}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 20,
  },
  number: {
    fontSize: 120,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
});
