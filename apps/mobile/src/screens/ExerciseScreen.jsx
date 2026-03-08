import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../api/client';
import { BouncyCard } from '../components/BouncyCard';
import { GlassCard } from '../components/GlassCard';
import { QuickChips } from '../components/QuickChips';
import { ScreenContainer } from '../components/ScreenContainer';
import { TitleBar } from '../components/TitleBar';
import { fetchDashboard, fetchExercises, showMascotEvent } from '../store/appSlice';
import { colors } from '../theme/colors';

const durationOptions = [
  { label: '10 min', value: 10 },
  { label: '20 min', value: 20 },
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 }
];

const emojiByCategory = {
  Strength: '🏋️',
  Yoga: '🧘',
  Cardio: '🏃'
};

export function ExerciseScreen({ navigation }) {
  const dispatch = useDispatch();
  const exercises = useSelector((s) => s.app.exercises);
  const [selectedId, setSelectedId] = useState(null);
  const [duration, setDuration] = useState(30);
  const [impact, setImpact] = useState(null);

  useEffect(() => {
    dispatch(fetchExercises());
  }, [dispatch]);

  const quickExercises = useMemo(() => exercises.slice(0, 9), [exercises]);
  const selected = quickExercises.find((item) => item.id === selectedId) || quickExercises[0];

  useEffect(() => {
    if (!selectedId && quickExercises.length) setSelectedId(quickExercises[0].id);
  }, [quickExercises]);

  async function logWorkout() {
    if (!selected) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const response = await api.post('/exercises/workouts', {
        exerciseId: selected.id,
        durationMin: duration,
        intensity: duration >= 30 ? 'moderate' : 'low'
      });

      const xp = response.data?.xpEvent?.xp_change || 0;
      setImpact(response.data?.bodyImpact || null);

      dispatch(fetchDashboard());
      dispatch(showMascotEvent({
        type: 'gain',
        xp,
        message: `${selected.name} complete. Your hero got stronger!`
      }));
    } catch {
      dispatch(showMascotEvent({
        type: 'loss',
        xp: 0,
        message: 'Workout could not be logged. Try once again.'
      }));
    }
  }

  return (
    <ScreenContainer>
      <TitleBar title="Workout Quest" subtitle="Choose move + duration" />

      <GlassCard>
        <Text style={styles.sectionTitle}>Tap Exercise</Text>
        <View style={styles.grid}>
          {quickExercises.map((exercise) => (
            <BouncyCard
              key={exercise.id}
              icon={emojiByCategory[exercise.category] || '💪'}
              label={exercise.name}
              caption={exercise.difficulty}
              selected={selected?.id === exercise.id}
              onPress={() => setSelectedId(exercise.id)}
              tone="#A5D8FF"
            />
          ))}
        </View>
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Duration</Text>
        <QuickChips options={durationOptions} selected={duration} onSelect={setDuration} />
      </GlassCard>

      <Pressable style={styles.button} onPress={logWorkout}>
        <Text style={styles.buttonText}>Log Workout +XP</Text>
      </Pressable>

      <Pressable
        style={styles.programBtn}
        onPress={() => {
          try {
            navigation.navigate('SatabdiProgram');
          } catch {
            dispatch(showMascotEvent({
              type: 'loss',
              xp: 0,
              message: 'Could not open Satabdi program. Please retry.'
            }));
          }
        }}
      >
        <Text style={styles.programBtnText}>Satabdi Training Program</Text>
      </Pressable>

      {impact ? (
        <GlassCard>
          <Text style={styles.sectionTitle}>Workout Impact</Text>
          <Text style={styles.impactText}>
            Burned ~{impact.caloriesBurned} kcal • Fat ~{impact.fatLossG}g • Muscle +{impact.muscleGainG}g
          </Text>
        </GlassCard>
      ) : null}
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
    backgroundColor: '#C9E8FF',
    borderWidth: 1,
    borderColor: '#9ECDFF',
    alignItems: 'center',
    paddingVertical: 14
  },
  buttonText: {
    fontFamily: 'Poppins_700Bold',
    color: '#2D658E',
    fontSize: 15
  },
  programBtn: {
    borderRadius: 16,
    backgroundColor: '#FCEBD2',
    borderWidth: 1,
    borderColor: '#F6D49C',
    alignItems: 'center',
    paddingVertical: 13
  },
  programBtnText: {
    fontFamily: 'Poppins_700Bold',
    color: '#946126',
    fontSize: 14
  },
  impactText: {
    fontFamily: 'Nunito_700Bold',
    color: colors.textSoft,
    fontSize: 13
  }
});
