import React from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

export function BouncyCard({ icon, label, caption, onPress, selected = false, tone = '#8EE3C0' }) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 5,
      tension: 180
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 150
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.card, selected ? { borderColor: tone, backgroundColor: `${tone}33` } : null]}
      >
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </Pressable>
    </Animated.View>
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
