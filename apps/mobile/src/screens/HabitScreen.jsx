import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useDispatch } from 'react-redux';
import { api } from '../api/client';
import { BouncyCard } from '../components/BouncyCard';
import { GlassCard } from '../components/GlassCard';
import { ScreenContainer } from '../components/ScreenContainer';
import { TitleBar } from '../components/TitleBar';
import { fetchDashboard, pushNotification, showMascotEvent } from '../store/appSlice';
import { colors } from '../theme/colors';

const positiveHabits = [
  { icon: '📚', name: 'Deep Work' },
  { icon: '🧼', name: 'Clean Space' },
  { icon: '🚶', name: 'Walk Break' },
  { icon: '💧', name: 'Hydration' },
  { icon: '🧘', name: 'Meditation' },
  { icon: '📵', name: 'No Social Scroll' }
];

const negativeActions = [
  { label: 'Smoking', key: 'cigarette', icon: '🚬' },
  { label: 'Alcohol', key: 'alcohol', icon: '🍺' },
  { label: 'Fast Food', key: 'fast_food', icon: '🍔' },
  { label: 'Sugary Dessert', key: 'sugary_dessert', icon: '🍰' }
];

export function HabitScreen() {
  const dispatch = useDispatch();
  const [selectedHabit, setSelectedHabit] = useState(positiveHabits[0]);

  async function logPositive() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const response = await api.post('/trackers/habits', { name: selectedHabit.name, status: 'done' });
      const xp = response.data?.xpEvent?.xp_change || 0;

      dispatch(fetchDashboard());
      dispatch(showMascotEvent({
        type: 'gain',
        xp,
        message: `${selectedHabit.name} complete. Discipline increased!`
      }));
    } catch {
      dispatch(pushNotification('Could not log habit right now.'));
    }
  }

  async function logNegative(action) {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      const response = await api.post('/trackers/negative', { actionKey: action.key });
      const xp = response.data?.xpEvent?.xp_change || -20;
      const recovery = response.data?.recoverySuggestion;

      dispatch(fetchDashboard());
      dispatch(showMascotEvent({
        type: 'loss',
        xp,
        message: 'That action reduced your XP a bit.',
        recovery
      }));

      if (recovery) dispatch(pushNotification(recovery));
    } catch {
      dispatch(pushNotification('Could not log this event right now.'));
    }
  }

  return (
    <ScreenContainer>
      <TitleBar title="Habit Arena" subtitle="Good habits = power ups" />

      <GlassCard>
        <Text style={styles.sectionTitle}>Choose Positive Habit</Text>
        <View style={styles.grid}>
          {positiveHabits.map((habit) => (
            <BouncyCard
              key={habit.name}
              icon={habit.icon}
              label={habit.name}
              selected={selectedHabit.name === habit.name}
              tone="#8EE3C0"
              onPress={() => setSelectedHabit(habit)}
            />
          ))}
        </View>
      </GlassCard>

      <Pressable style={styles.goodBtn} onPress={logPositive}>
        <Text style={styles.goodText}>Complete Habit +XP</Text>
      </Pressable>

      <GlassCard>
        <Text style={styles.sectionTitle}>Oops Actions (gentle tracking)</Text>
        <View style={styles.grid}>
          {negativeActions.map((action) => (
            <BouncyCard
              key={action.key}
              icon={action.icon}
              label={action.label}
              tone="#FFBFC9"
              onPress={() => logNegative(action)}
            />
          ))}
        </View>
      </GlassCard>
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
  goodBtn: {
    borderRadius: 16,
    backgroundColor: '#CFF5E7',
    borderWidth: 1,
    borderColor: '#8EDABA',
    alignItems: 'center',
    paddingVertical: 14
  },
  goodText: {
    fontFamily: 'Poppins_700Bold',
    color: '#25735A',
    fontSize: 15
  }
});
