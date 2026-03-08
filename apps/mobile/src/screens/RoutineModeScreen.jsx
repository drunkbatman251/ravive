import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '../api/client';
import { GlassCard } from '../components/GlassCard';
import { ScreenContainer } from '../components/ScreenContainer';
import { StickFigureDemo } from '../components/StickFigureDemo';
import { TitleBar } from '../components/TitleBar';
import { colors } from '../theme/colors';

function makeSteps(day) {
  const output = [];
  (day?.warmup || []).forEach((item) => output.push({ ...item, section: 'Warm-Up' }));
  (day?.main || []).forEach((item, idx, arr) => {
    output.push({ ...item, section: 'Main' });
    if (idx < arr.length - 1) {
      output.push({
        name: 'Rest',
        section: 'Rest',
        sets: 1,
        durationSec: day?.restSec || 45,
        instructions: 'Catch breath and hydrate if needed.',
        focusTip: 'Slow breathing',
        animation: 'breathing',
        estimated: { calories: 0, fatLossG: 0, muscleGainG: 0 }
      });
    }
  });
  (day?.cooldown || []).forEach((item) => output.push({ ...item, section: 'Cool-Down' }));
  return output;
}

export function RoutineModeScreen({ route, navigation }) {
  const week = Number(route.params?.week || 1);
  const dayNo = Number(route.params?.dayNo || 1);

  const [loading, setLoading] = useState(true);
  const [dayData, setDayData] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState('');

  async function loadDay() {
    try {
      setLoading(true);
      setError('');
      setStepIndex(0);
      setComplete(false);
      const response = await api.get(`/programs/satabdi/day/${dayNo}`, { params: { week } });
      setDayData(response.data?.day || null);
    } catch {
      setError('Could not load routine. Please retry.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDay();
  }, [week, dayNo]);

  const steps = useMemo(() => (dayData ? makeSteps(dayData) : []), [dayData]);
  const step = steps[stepIndex];

  useEffect(() => {
    if (!step) return;
    const defaultDuration = step.durationSec || Math.max(25, (step.reps || 10) * 4);
    setTimer(defaultDuration);
  }, [stepIndex, step?.name]);

  useEffect(() => {
    if (!step || complete || timer <= 0) return;
    const id = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [timer, step?.name, complete]);

  useEffect(() => {
    if (!step || complete || timer > 0) return;
    if (stepIndex < steps.length - 1) {
      setStepIndex((x) => x + 1);
      return;
    }

    async function finishDay() {
      try {
        const totals = dayData?.totalEstimated || { calories: 0, fatLossG: 0, muscleGainG: 0 };
        await api.post(`/programs/satabdi/day/${dayNo}/complete`, {
          week,
          caloriesBurned: totals.calories,
          fatLossG: totals.fatLossG,
          muscleGainG: totals.muscleGainG
        });
        setComplete(true);
      } catch {
        setError('Could not save completion. You can still continue.');
        setComplete(true);
      }
    }

    finishDay();
  }, [timer, stepIndex, steps.length, complete, dayData]);

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator color="#43CDA2" />
      </ScreenContainer>
    );
  }

  if (error && !dayData) {
    return (
      <ScreenContainer>
        <TitleBar title="Routine Mode" subtitle={`Week ${week} • Day ${dayNo}`} />
        <GlassCard>
          <Text style={styles.desc}>{error}</Text>
          <Pressable style={styles.primaryBtn} onPress={loadDay}>
            <Text style={styles.primaryText}>Retry</Text>
          </Pressable>
        </GlassCard>
      </ScreenContainer>
    );
  }

  if (!steps.length || !step) {
    return (
      <ScreenContainer>
        <TitleBar title="Routine Mode" subtitle={`Week ${week} • Day ${dayNo}`} />
        <GlassCard>
          <Text style={styles.desc}>No steps found for this day.</Text>
          <Pressable style={styles.primaryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.primaryText}>Back</Text>
          </Pressable>
        </GlassCard>
      </ScreenContainer>
    );
  }

  if (complete) {
    return (
      <ScreenContainer>
        <TitleBar title="Day Complete" subtitle={`Week ${week} • Day ${dayNo}`} />
        <GlassCard>
          <Text style={styles.doneTitle}>Excellent session complete ✅</Text>
          <Text style={styles.impact}>
            Burned ~{dayData.totalEstimated.calories} kcal • Fat ~{dayData.totalEstimated.fatLossG}g • Muscle +{dayData.totalEstimated.muscleGainG}g
          </Text>
        </GlassCard>
        <Pressable style={styles.primaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryText}>Back to Program</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  const repLabel = step?.durationSec ? `${step.durationSec}s` : `${step.reps || 0}${step.perLeg ? ' /leg' : step.perSide ? ' /side' : ''}`;

  return (
    <ScreenContainer scroll={false}>
      <TitleBar title={`Day ${dayNo} Routine`} subtitle={`Week ${week} • ${dayData.title}`} />
      <GlassCard style={{ flex: 1 }}>
        <Text style={styles.badge}>{step.section}</Text>
        <Text style={styles.name}>{step.name}</Text>
        <Text style={styles.meta}>{step.sets} sets • {repLabel}</Text>

        <View style={{ alignItems: 'center', marginTop: 12 }}>
          <StickFigureDemo animation={step.animation} />
        </View>

        <Text style={styles.timer}>{timer}s</Text>
        <Text style={styles.desc}>{step.instructions}</Text>
        <Text style={styles.focus}>Focus: {step.focusTip}</Text>
      </GlassCard>

      <GlassCard>
        <Text style={styles.stepCounter}>Step {stepIndex + 1} of {steps.length}</Text>
      </GlassCard>

      <Pressable
        style={styles.primaryBtn}
        onPress={() => {
          if (stepIndex < steps.length - 1) setStepIndex((x) => x + 1);
          else setTimer(0);
        }}
      >
        <Text style={styles.primaryText}>Next Step</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#EDF3FF',
    color: '#4E668D',
    fontFamily: 'Nunito_700Bold',
    fontSize: 12
  },
  name: {
    marginTop: 8,
    fontFamily: 'Poppins_700Bold',
    color: colors.text,
    fontSize: 22
  },
  meta: {
    marginTop: 2,
    fontFamily: 'Nunito_700Bold',
    color: colors.textSoft,
    fontSize: 13
  },
  timer: {
    marginTop: 10,
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
    color: '#2D5C8C',
    fontSize: 40
  },
  desc: {
    marginTop: 8,
    fontFamily: 'Nunito_700Bold',
    color: '#506380',
    fontSize: 14
  },
  focus: {
    marginTop: 4,
    fontFamily: 'Nunito_700Bold',
    color: '#2D7159',
    fontSize: 13
  },
  stepCounter: {
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
    color: colors.text,
    fontSize: 14
  },
  primaryBtn: {
    borderRadius: 16,
    backgroundColor: '#DCCBFF',
    borderWidth: 1,
    borderColor: '#BAA3FF',
    alignItems: 'center',
    paddingVertical: 14
  },
  primaryText: {
    fontFamily: 'Poppins_700Bold',
    color: '#4F3E8A',
    fontSize: 14
  },
  doneTitle: {
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
    color: colors.text,
    fontSize: 20
  },
  impact: {
    marginTop: 6,
    textAlign: 'center',
    fontFamily: 'Nunito_700Bold',
    color: '#4F6384',
    fontSize: 13
  }
});
