import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../components/GlassCard';
import { ScreenContainer } from '../components/ScreenContainer';
import { TitleBar } from '../components/TitleBar';
import { fetchAnalytics } from '../store/appSlice';
import { colors } from '../theme/colors';

function MiniBars({ data = [], color = '#43E8B2', unit = '' }) {
  const points = data.slice(-10);
  const max = Math.max(1, ...points.map((d) => Number(d.value || 0)));

  return (
    <View style={styles.chartWrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartRow}>
        {points.map((item, idx) => {
          const value = Number(item.value || 0);
          const height = Math.max(8, (value / max) * 76);
          return (
            <View key={`${item.label}-${idx}`} style={styles.barCol}>
              <View style={styles.track}>
                <LinearGradient
                  colors={[`${color}BB`, `${color}`]}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  style={[styles.fill, { height }]}
                />
              </View>
              <Text style={styles.value}>{Math.round(value)}{unit}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function QuestCard({ title, hint, color, data, unit }) {
  return (
    <GlassCard>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.hint}>{hint}</Text>
      <MiniBars data={data.length ? data : [{ label: '1', value: 0 }]} color={color} unit={unit} />
    </GlassCard>
  );
}

export function AnalyticsScreen() {
  const dispatch = useDispatch();
  const analytics = useSelector((s) => s.app.analytics);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  const xpData = (analytics?.xpGrowth || []).map((x, i) => ({ label: `${i + 1}`, value: Number(x.xp) }));
  const workoutData = (analytics?.workoutFrequency || []).map((x, i) => ({ label: `${i + 1}`, value: Number(x.sessions) }));
  const sleepData = (analytics?.sleepTrend || []).map((x, i) => ({ label: `${i + 1}`, value: Number(x.hours) }));
  const nutritionData = (analytics?.nutritionTrend || []).map((x, i) => ({ label: `${i + 1}`, value: Number(x.calories) }));
  const weightData = (analytics?.weightTrend || []).map((x, i) => ({ label: `${i + 1}`, value: Number(x.weight) }));

  return (
    <ScreenContainer>
      <TitleBar title="Progress Playground" subtitle="Cute charts, real growth" />
      <GlassCard>
        <LinearGradient colors={['#CCF4E3', '#D8EAFF']} style={styles.banner}>
          <Text style={styles.bannerTitle}>Weekly Vibes</Text>
          <Text style={styles.bannerText}>Tiny bars, big progress. Keep the streak alive.</Text>
        </LinearGradient>
      </GlassCard>

      <QuestCard title="XP Glow" hint="XP earned per day" color="#67D9AE" data={xpData} />
      <QuestCard title="Workout Spark" hint="Sessions completed" color="#88BFFF" data={workoutData} />
      <QuestCard title="Sleep Cloud" hint="Hours slept" color="#FFC889" data={sleepData} unit="h" />
      <QuestCard title="Fuel Meter" hint="Daily calories" color="#FFB59F" data={nutritionData} />
      <QuestCard title="Body Curve" hint="Weight trend" color="#C7A8FF" data={weightData} unit="kg" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#CBE0F8'
  },
  bannerTitle: {
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    fontSize: 16
  },
  bannerText: {
    color: colors.textSoft,
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    marginTop: 4
  },
  cardTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: colors.text
  },
  hint: {
    marginTop: 2,
    marginBottom: 8,
    fontFamily: 'Nunito_700Bold',
    color: colors.textSoft,
    fontSize: 12
  },
  chartWrap: { minHeight: 110 },
  chartRow: {
    alignItems: 'flex-end',
    gap: 8,
    paddingVertical: 2
  },
  barCol: {
    width: 28,
    alignItems: 'center'
  },
  track: {
    width: 16,
    height: 78,
    borderRadius: 999,
    backgroundColor: '#E8EEF9',
    justifyContent: 'flex-end',
    overflow: 'hidden'
  },
  fill: {
    width: '100%',
    borderRadius: 999
  },
  value: {
    marginTop: 4,
    fontFamily: 'Nunito_700Bold',
    color: '#60739A',
    fontSize: 10
  }
});
