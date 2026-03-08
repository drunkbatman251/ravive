import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useDispatch } from 'react-redux';
import { api } from '../api/client';
import { GlassCard } from '../components/GlassCard';
import { QuickChips } from '../components/QuickChips';
import { ScreenContainer } from '../components/ScreenContainer';
import { TitleBar } from '../components/TitleBar';
import { fetchDashboard, pushNotification, showMascotEvent } from '../store/appSlice';
import { colors } from '../theme/colors';

const hourOptions = [
  { label: '4h', value: 4 },
  { label: '5h', value: 5 },
  { label: '6h', value: 6 },
  { label: '7h', value: 7 },
  { label: '8h', value: 8 }
];

export function SleepScreen() {
  const dispatch = useDispatch();
  const [hours, setHours] = useState(7);

  async function logSleep() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const response = await api.post('/trackers/sleep', {
        hours,
        quality: hours >= 7 ? 'good' : 'poor',
        deepSleepHours: Math.max(1, hours * 0.3),
        consistencyScore: hours >= 7 ? 80 : 55
      });

      const xp = response.data?.xpEvent?.xp_change || 0;
      const recovery = response.data?.recoverySuggestion;

      dispatch(fetchDashboard());
      dispatch(showMascotEvent({
        type: xp >= 0 ? 'gain' : 'loss',
        xp,
        message: xp >= 0 ? 'Sleep quest complete. Recovery power up!' : 'Short sleep logged gently.',
        recovery
      }));

      if (recovery) dispatch(pushNotification(recovery));
    } catch {
      dispatch(pushNotification('Could not log sleep right now.'));
    }
  }

  return (
    <ScreenContainer>
      <TitleBar title="Sleep Nest" subtitle="Tap hours and done" />
      <GlassCard>
        <Text style={styles.sectionTitle}>How long did you sleep?</Text>
        <QuickChips options={hourOptions} selected={hours} onSelect={setHours} />
      </GlassCard>
      <Pressable style={styles.button} onPress={logSleep}>
        <Text style={styles.buttonText}>Log Sleep +XP</Text>
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
  button: {
    borderRadius: 16,
    backgroundColor: '#DDE6FF',
    borderWidth: 1,
    borderColor: '#BECBFB',
    alignItems: 'center',
    paddingVertical: 14
  },
  buttonText: {
    fontFamily: 'Poppins_700Bold',
    color: '#495C9A',
    fontSize: 15
  }
});
