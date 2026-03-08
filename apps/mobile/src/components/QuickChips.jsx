import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function QuickChips({ options, selected, onSelect }) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const active = selected === option.value;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => onSelect(option.value)}
            hitSlop={6}
            style={({ pressed }) => [
              styles.chip,
              active ? styles.chipActive : null,
              pressed ? styles.chipPressed : null
            ]}
          >
            <Text style={[styles.text, active ? styles.textActive : null]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE8F7',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 42,
    justifyContent: 'center'
  },
  chipActive: {
    backgroundColor: '#CFF5E7',
    borderColor: '#7FD9B2'
  },
  chipPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9
  },
  text: {
    color: colors.textSoft,
    fontFamily: 'Nunito_700Bold',
    fontSize: 13
  },
  textActive: {
    color: '#1E6651'
  }
});
