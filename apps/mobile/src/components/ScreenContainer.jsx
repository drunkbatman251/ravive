import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, View } from 'react-native';
import { gradients } from '../theme/colors';

export function ScreenContainer({ children, scroll = true }) {
  const body = (
    <View style={[styles.inner, !scroll ? styles.innerFull : null]}>
      {children}
    </View>
  );

  return (
    <LinearGradient colors={gradients.appBg} style={styles.page}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {scroll ? (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {body}
          </ScrollView>
        ) : body}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  safe: { flex: 1 },
  scrollContent: { paddingBottom: 96 },
  inner: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12
  },
  innerFull: {
    flex: 1
  }
});
