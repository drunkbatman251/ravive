import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useDispatch } from 'react-redux';
import { api } from '../api/client';
import { BouncyCard } from '../components/BouncyCard';
import { GlassCard } from '../components/GlassCard';
import { QuickChips } from '../components/QuickChips';
import { ScreenContainer } from '../components/ScreenContainer';
import { TitleBar } from '../components/TitleBar';
import { fetchDashboard, pushNotification, showMascotEvent } from '../store/appSlice';
import { colors } from '../theme/colors';

const books = [
  { icon: '📘', title: 'Atomic Habits' },
  { icon: '📗', title: 'Deep Work' },
  { icon: '📙', title: 'The Psychology of Money' },
  { icon: '📰', title: 'Research Article' }
];

const timeOptions = [
  { label: '10 min', value: 10 },
  { label: '20 min', value: 20 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 }
];

export function ReadingScreen() {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(books[0]);
  const [minutes, setMinutes] = useState(20);

  async function logReading() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const response = await api.post('/trackers/reading', {
        title: selected.title,
        pagesRead: Math.round(minutes / 2),
        minutesRead: minutes
      });

      const xp = response.data?.xpEvent?.xp_change || 0;
      dispatch(fetchDashboard());
      dispatch(showMascotEvent({
        type: 'gain',
        xp,
        message: `Brain boost unlocked from ${selected.title}!`
      }));
    } catch {
      dispatch(pushNotification('Could not log reading right now.'));
    }
  }

  return (
    <ScreenContainer>
      <TitleBar title="Reading Den" subtitle="Choose title + time" />

      <GlassCard>
        <Text style={styles.sectionTitle}>Book / Article</Text>
        <View style={styles.grid}>
          {books.map((item) => (
            <BouncyCard
              key={item.title}
              icon={item.icon}
              label={item.title}
              selected={selected.title === item.title}
              tone="#FFE0B9"
              onPress={() => setSelected(item)}
            />
          ))}
        </View>
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Reading Time</Text>
        <QuickChips options={timeOptions} selected={minutes} onSelect={setMinutes} />
      </GlassCard>

      <Pressable style={styles.button} onPress={logReading}>
        <Text style={styles.buttonText}>Log Reading +XP</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    color: colors.text,
    fontSize: 16,
    marginBottom: 10
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  button: {
    borderRadius: 16,
    backgroundColor: '#FFE8CF',
    borderWidth: 1,
    borderColor: '#F7CFA6',
    alignItems: 'center',
    paddingVertical: 14
  },
  buttonText: {
    fontFamily: 'Poppins_700Bold',
    color: '#8B5B30',
    fontSize: 15
  }
});
