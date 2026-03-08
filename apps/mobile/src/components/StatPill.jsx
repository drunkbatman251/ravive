import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function StatPill({ label, value, icon }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.label}>{icon ? `${icon} ${label}` : label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    minWidth: 92,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EEF9'
  },
  label: {
    color: colors.textSoft,
    fontFamily: 'Nunito_700Bold',
    fontSize: 11
  },
  value: {
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    marginTop: 2
  }
});
