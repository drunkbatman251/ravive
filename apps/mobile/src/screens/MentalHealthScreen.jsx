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

const moods = [
  { icon: '😄', value: 'Happy' },
  { icon: '🙂', value: 'Calm' },
  { icon: '😴', value: 'Tired' },
  { icon: '😵', value: 'Stressed' },
  { icon: '😟', value: 'Anxious' }
];

const medOptions = [
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '20 min', value: 20 }
];

export function MentalHealthScreen() {
  const dispatch = useDispatch();
  const [mood, setMood] = useState(moods[1]);
  const [medMinutes, setMedMinutes] = useState(20);

  async function logMood() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const response = await api.post('/trackers/mood', {
        mood: mood.value,
        stressLevel: mood.value === 'Stressed' ? 8 : mood.value === 'Anxious' ? 7 : 4,
        meditationMinutes: medMinutes
      });

      const xp = response.data?.xpEvent?.xp_change || 0;
      dispatch(fetchDashboard());
      dispatch(showMascotEvent({
        type: xp >= 0 ? 'gain' : 'loss',
        xp,
        message: xp >= 0 ? 'Mind calmed. Focus grew.' : 'Rough moment logged. You can recover with breathing.'
      }));
    } catch {
      dispatch(pushNotification('Could not log mood right now.'));
    }
  }

  return (
    <ScreenContainer>
      <TitleBar title="Mind Garden" subtitle="Mood + meditation in two taps" />
      <GlassCard>
        <Text style={styles.sectionTitle}>How do you feel?</Text>
        <View style={styles.grid}>
          {moods.map((item) => (
            <BouncyCard
              key={item.value}
              icon={item.icon}
              label={item.value}
              selected={item.value === mood.value}
              tone="#DCC6FF"
              onPress={() => setMood(item)}
            />
          ))}
        </View>
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Meditation</Text>
        <QuickChips options={medOptions} selected={medMinutes} onSelect={setMedMinutes} />
      </GlassCard>

      <Pressable style={styles.button} onPress={logMood}>
        <Text style={styles.buttonText}>Log Mind Session +XP</Text>
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
    backgroundColor: '#E7D8FF',
    borderWidth: 1,
    borderColor: '#CCB4FF',
    alignItems: 'center',
    paddingVertical: 14
  },
  buttonText: {
    fontFamily: 'Poppins_700Bold',
    color: '#684A9B',
    fontSize: 15
  }
});
