import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';

export function XPBar({ xpIntoLevel = 0, xpToNextLevel = 100, level = 1 }) {
  const ratio = Math.max(0, Math.min(1, xpIntoLevel / Math.max(1, xpToNextLevel)));
  const progress = useSharedValue(ratio);
  const glow = useSharedValue(0.18);

  useEffect(() => {
    progress.value = withTiming(ratio, { duration: 500 });
    glow.value = withSequence(withTiming(0.6, { duration: 180 }), withTiming(0.2, { duration: 420 }));
  }, [ratio]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <View>
      <View style={styles.topRow}>
        <Text style={styles.level}>Lv {level}</Text>
        <Text style={styles.value}>{xpIntoLevel}/{xpToNextLevel} XP</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.glow, glowStyle]} />
        <Animated.View style={[styles.fill, fillStyle]}>
          <LinearGradient colors={gradients.xp} style={StyleSheet.absoluteFill} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  level: {
    fontFamily: 'Poppins_700Bold',
    color: colors.text,
    fontSize: 13
  },
  value: {
    fontFamily: 'Nunito_700Bold',
    color: colors.textSoft,
    fontSize: 12
  },
  track: {
    height: 16,
    borderRadius: 999,
    backgroundColor: '#E7EEF9',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D6E2F2'
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden'
  },
  glow: {
    position: 'absolute',
    top: -12,
    right: 8,
    width: 24,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF'
  }
});
