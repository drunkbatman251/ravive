import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors } from '../theme/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BouncyCard({ icon, label, caption, onPress, selected = false, tone = '#8EE3C0' }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.95, { damping: 12, stiffness: 260 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.card, animatedStyle, selected ? { borderColor: tone, backgroundColor: `${tone}33` } : null]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '30%',
    minHeight: 96,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EDFB',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4
  },
  icon: {
    fontSize: 24
  },
  label: {
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    textAlign: 'center'
  },
  caption: {
    color: colors.textSoft,
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    textAlign: 'center'
  }
});
