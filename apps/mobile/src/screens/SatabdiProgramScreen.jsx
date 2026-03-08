import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '../api/client';
import { GlassCard } from '../components/GlassCard';
import { ScreenContainer } from '../components/ScreenContainer';
import { StickFigureDemo } from '../components/StickFigureDemo';
import { TitleBar } from '../components/TitleBar';
import { colors } from '../theme/colors';

function ExerciseCard({ item }) {
  const repLabel = item.durationSec
    ? `${item.durationSec}s`
    : `${item.reps || 0}${item.perSide ? ' /side' : item.perLeg ? ' /leg' : ''}`;

  return (
    <View style={styles.exerciseCard}>
      <StickFigureDemo animation={item.animation} />
      <View style={{ flex: 1 }}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseMeta}>
          {item.sets} sets • {repLabel}
        </Text>
        <Text style={styles.exerciseText}>{item.instructions}</Text>
        <Text style={styles.focus}>Focus: {item.focusTip}</Text>
        <Text style={styles.impact}>
          Burn ~{item.estimated?.calories || 0} kcal • Fat ~{item.estimated?.fatLossG || 0}g • Muscle +{item.estimated?.muscleGainG || 0}g
        </Text>
      </View>
    </View>
  );
}

function Section({ title, list }) {
  const safeList = Array.isArray(list) ? list : [];
  return (
    <GlassCard>
      <Text style={styles.sectionTitle}>{title}</Text>
      {safeList.map((item) => <ExerciseCard key={`${title}-${item.name}`} item={item} />)}
    </GlassCard>
  );
}

export function SatabdiProgramScreen({ navigation }) {
  const [week, setWeek] = useState(1);
  const [dayNo, setDayNo] = useState(1);
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState(null);
  const [error, setError] = useState('');

  async function loadProgram(nextWeek = week) {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/programs/satabdi', { params: { week: nextWeek } });
      setProgram(response.data || null);
      if (response?.data?.days?.length && !response.data.days.some((d) => d.day === dayNo)) {
        setDayNo(response.data.days[0].day);
      }
    } catch {
      setError('Could not load Satabdi program. Please retry.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProgram(week);
  }, [week]);

  const selectedDay = useMemo(
    () => program?.days?.find((d) => d.day === dayNo),
    [program, dayNo]
  );

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator color="#43CDA2" />
      </ScreenContainer>
    );
  }

  if (error || !program) {
    return (
      <ScreenContainer>
        <TitleBar title="Satabdi Training Program" subtitle="8-Week Low Impact Strength" />
        <GlassCard>
          <Text style={styles.safety}>{error || 'Program is unavailable right now.'}</Text>
          <Pressable style={styles.startBtn} onPress={() => loadProgram(week)}>
            <Text style={styles.startBtnText}>Retry</Text>
          </Pressable>
        </GlassCard>
      </ScreenContainer>
    );
  }

  const days = Array.isArray(program.days) ? program.days : [];
  const completedDays = Object.keys(program.completion || {}).length;
  const total = selectedDay?.totalEstimated || { calories: 0, fatLossG: 0, muscleGainG: 0 };

  return (
    <ScreenContainer>
      <TitleBar title="Satabdi Training Program" subtitle="8-Week Low Impact Strength" />

      <GlassCard>
        <Text style={styles.metaText}>Week {week} of 8 • {program.cycle}</Text>
        <Text style={styles.progression}>{program.progressionNote}</Text>
        <Text style={styles.metaText}>Completed this week: {completedDays}/6 days</Text>
        <View style={styles.chipWrap}>
          {Array.from({ length: 8 }, (_, i) => i + 1).map((w) => (
            <Pressable key={w} style={[styles.chip, week === w ? styles.chipActive : null]} onPress={() => setWeek(w)}>
              <Text style={[styles.chipText, week === w ? styles.chipTextActive : null]}>W{w}</Text>
            </Pressable>
          ))}
        </View>
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Select Workout Day</Text>
        <View style={styles.chipWrap}>
          {days.map((d) => (
            <Pressable key={d.day} style={[styles.dayChip, dayNo === d.day ? styles.dayChipActive : null]} onPress={() => setDayNo(d.day)}>
              <Text style={[styles.dayText, dayNo === d.day ? styles.dayTextActive : null]}>Day {d.day}</Text>
            </Pressable>
          ))}
        </View>
      </GlassCard>

      {selectedDay ? (
        <>
          <GlassCard>
            <Text style={styles.dayTitle}>Day {selectedDay.day}: {selectedDay.title}</Text>
            <Text style={styles.impact}>
              Total est. today: {total.calories} kcal • Fat {total.fatLossG}g • Muscle +{total.muscleGainG}g
            </Text>
          </GlassCard>

          <Section title="Warm-Up (3 minutes)" list={selectedDay.warmup} />
          <Section title="Main Exercises" list={selectedDay.main} />
          <Section title="Cool-Down (3 minutes)" list={selectedDay.cooldown} />

          <GlassCard>
            <Text style={styles.sectionTitle}>Safety Notes</Text>
            {(selectedDay.safetyNotes || []).map((note) => (
              <Text key={note} style={styles.safety}>• {note}</Text>
            ))}
          </GlassCard>

          <Pressable
            style={styles.startBtn}
            onPress={() => navigation.navigate('RoutineMode', { week, dayNo })}
          >
            <Text style={styles.startBtnText}>Start Day {dayNo} Routine</Text>
          </Pressable>
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  metaText: {
    fontFamily: 'Nunito_700Bold',
    color: colors.textSoft,
    fontSize: 13
  },
  progression: {
    marginVertical: 6,
    fontFamily: 'Poppins_700Bold',
    color: colors.text,
    fontSize: 14
  },
  chipWrap: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#DAE5F9',
    backgroundColor: '#FFFFFF'
  },
  chipActive: {
    backgroundColor: '#D5EDFF',
    borderColor: '#A7CFFE'
  },
  chipText: {
    fontFamily: 'Nunito_700Bold',
    color: colors.textSoft
  },
  chipTextActive: {
    color: '#2B598E'
  },
  dayChip: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DAE5F9',
    backgroundColor: '#FFFFFF'
  },
  dayChipActive: {
    backgroundColor: '#FFEBD3',
    borderColor: '#F4CF9B'
  },
  dayText: {
    fontFamily: 'Poppins_700Bold',
    color: colors.textSoft,
    fontSize: 13
  },
  dayTextActive: {
    color: '#8F5D25'
  },
  dayTitle: {
    fontFamily: 'Poppins_700Bold',
    color: colors.text,
    fontSize: 15
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    color: colors.text,
    fontSize: 15,
    marginBottom: 8
  },
  exerciseCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5ECFA',
    backgroundColor: '#FFFFFF',
    padding: 10,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8
  },
  exerciseName: {
    fontFamily: 'Poppins_700Bold',
    color: colors.text,
    fontSize: 13
  },
  exerciseMeta: {
    marginTop: 2,
    fontFamily: 'Nunito_700Bold',
    color: colors.textSoft,
    fontSize: 12
  },
  exerciseText: {
    marginTop: 4,
    fontFamily: 'Nunito_700Bold',
    color: '#516481',
    fontSize: 12
  },
  focus: {
    marginTop: 2,
    fontFamily: 'Nunito_700Bold',
    color: '#2B6E58',
    fontSize: 12
  },
  impact: {
    marginTop: 4,
    fontFamily: 'Nunito_700Bold',
    color: '#5F6F8B',
    fontSize: 12
  },
  safety: {
    fontFamily: 'Nunito_700Bold',
    color: '#5A6A85',
    fontSize: 12,
    marginTop: 4
  },
  startBtn: {
    borderRadius: 16,
    backgroundColor: '#DCCBFF',
    borderWidth: 1,
    borderColor: '#BAA3FF',
    alignItems: 'center',
    paddingVertical: 14
  },
  startBtnText: {
    fontFamily: 'Poppins_700Bold',
    color: '#4F3E8A',
    fontSize: 14
  }
});
