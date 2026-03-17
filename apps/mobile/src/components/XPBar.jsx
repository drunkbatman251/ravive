import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';

export function XPBar({ xpIntoLevel = 0, xpToNextLevel = 100, level = 1 }) {
  const ratio = Math.max(0, Math.min(1, xpIntoLevel / Math.max(1, xpToNextLevel)));
  const progress = useRef(new Animated.Value(ratio)).current;
  const glow = useRef(new Animated.Value(0.18)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: ratio,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false
    }).start();
    Animated.sequence([
      Animated.timing(glow, { toValue: 0.6, duration: 180, useNativeDriver: false }),
      Animated.timing(glow, { toValue: 0.2, duration: 420, useNativeDriver: false })
    ]).start();
  }, [glow, progress, ratio]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <View>
      <View style={styles.topRow}>
        <Text style={styles.level}>Lv {level}</Text>
        <Text style={styles.value}>{xpIntoLevel}/{xpToNextLevel} XP</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.glow, { opacity: glow }]} />
        <Animated.View style={[styles.fill, { width }]}>
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
