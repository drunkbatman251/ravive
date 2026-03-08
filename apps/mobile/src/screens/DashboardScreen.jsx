import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { GlassCard } from '../components/GlassCard';
import { ScreenContainer } from '../components/ScreenContainer';
import { StatPill } from '../components/StatPill';
import { TitleBar } from '../components/TitleBar';
import { XPBar } from '../components/XPBar';
import { BouncyCard } from '../components/BouncyCard';
import {
  completeDailyMiniChallenge,
  fetchAiCoach,
  fetchDailyMiniChallenge,
  fetchDashboard,
  pushNotification,
  showMascotEvent
} from '../store/appSlice';
import { levelTitle } from '../utils/labels';
import { colors } from '../theme/colors';

const quickActions = [
  { icon: '🍎', label: 'Log Meal', screen: 'Nutrition' },
  { icon: '💪', label: 'Workout', screen: 'Exercise' },
  { icon: '🧘', label: 'Meditate', screen: 'MentalHealth' },
  { icon: '📖', label: 'Read', screen: 'Reading' },
  { icon: '🌙', label: 'Sleep', screen: 'Sleep' },
  { icon: '🔥', label: 'Habits', screen: 'Habit' },
  { icon: '⚔️', label: 'Social', screen: 'Social' }
];

export function DashboardScreen({ navigation }) {
  const dispatch = useDispatch();
  const dashboard = useSelector((s) => s.app.dashboard);
  const aiCoach = useSelector((s) => s.app.aiCoach);
  const miniChallenge = useSelector((s) => s.app.miniChallenge);

  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchAiCoach());
    dispatch(fetchDailyMiniChallenge());
  }, [dispatch]);

  const user = dashboard?.user;
  const streak = dashboard?.streaks?.find((s) => s.streak_type === 'workout')?.current_count || 0;

  return (
    <ScreenContainer>
      <TitleBar
        title="Ravive"
        subtitle="Revive Your Life • Built by Ravi"
        right={
          <Pressable style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.avatarText}>🧸</Text>
          </Pressable>
        }
      />

      <GlassCard>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.levelText}>Level {user?.level || 1} • {levelTitle(user?.level || 1)}</Text>
            <Text style={styles.score}>Daily Score {user?.life_score || 0}</Text>
          </View>
          <View style={styles.streakWrap}>
            <Text style={styles.streakText}>🔥 {streak} day streak</Text>
          </View>
        </View>

        <View style={{ marginTop: 10 }}>
          <XPBar
            level={user?.level || 1}
            xpIntoLevel={user?.xpIntoLevel || 0}
            xpToNextLevel={user?.xpToNextLevel || 100}
          />
        </View>
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Hero Stats</Text>
        <View style={styles.pills}>
          <StatPill icon="❤️" label="Health" value={user?.stats?.health || 0} />
          <StatPill icon="💥" label="Strength" value={user?.stats?.strength || 0} />
          <StatPill icon="🎯" label="Focus" value={user?.stats?.focus || 0} />
          <StatPill icon="🛡️" label="Discipline" value={user?.stats?.discipline || 0} />
          <StatPill icon="🧠" label="Knowledge" value={user?.stats?.knowledge || 0} />
        </View>
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Quick Log (1 tap)</Text>
        <View style={styles.quickGrid}>
          {quickActions.map((item) => (
            <BouncyCard
              key={item.label}
              icon={item.icon}
              label={item.label}
              onPress={() => navigation.navigate(item.screen)}
            />
          ))}
        </View>
      </GlassCard>

      {miniChallenge?.challenge_payload ? (
        <GlassCard>
          <Text style={styles.sectionTitle}>Mini Challenge (&lt;5 min)</Text>
          <Text style={styles.challengeTitle}>🎯 {miniChallenge.challenge_payload.title}</Text>
          <Text style={styles.challengeMeta}>
            Reward +{miniChallenge.challenge_payload.xpReward} XP • {Math.ceil((miniChallenge.challenge_payload.durationSec || 60) / 60)} min
          </Text>
          <Pressable
            disabled={miniChallenge.completed}
            style={[styles.challengeBtn, miniChallenge.completed ? styles.challengeDone : null]}
            onPress={async () => {
              try {
                await dispatch(completeDailyMiniChallenge(miniChallenge.challenge_payload.id)).unwrap();
                dispatch(fetchDashboard());
                dispatch(showMascotEvent({
                  type: 'gain',
                  xp: miniChallenge.challenge_payload.xpReward,
                  message: 'Mini challenge completed! Tiny wins build elite habits.'
                }));
              } catch {
                dispatch(pushNotification('Mini challenge could not be completed right now.'));
              }
            }}
          >
            <Text style={styles.challengeBtnText}>
              {miniChallenge.completed ? 'Completed ✅' : 'Complete Challenge'}
            </Text>
          </Pressable>
        </GlassCard>
      ) : null}

      <GlassCard>
        <Text style={styles.sectionTitle}>Coach Whisper</Text>
        <Text style={styles.coachText}>{aiCoach || 'Your buddy is planning today\'s best XP route...'}</Text>
      </GlassCard>

      <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('Achievements')}>
        <Text style={styles.actionBtnText}>Achievement Gallery ✨</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5ECFA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 26
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  levelText: {
    fontFamily: 'Nunito_700Bold',
    color: colors.textSoft,
    fontSize: 14
  },
  score: {
    marginTop: 2,
    fontFamily: 'Poppins_700Bold',
    color: colors.text,
    fontSize: 23
  },
  streakWrap: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFEFD6'
  },
  streakText: {
    fontFamily: 'Nunito_700Bold',
    color: '#B67220',
    fontSize: 12
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    color: colors.text,
    fontSize: 16,
    marginBottom: 10
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  coachText: {
    color: colors.textSoft,
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    lineHeight: 20
  },
  challengeTitle: {
    fontFamily: 'Poppins_700Bold',
    color: colors.text,
    fontSize: 15
  },
  challengeMeta: {
    marginTop: 4,
    fontFamily: 'Nunito_700Bold',
    color: colors.textSoft,
    fontSize: 12
  },
  challengeBtn: {
    marginTop: 10,
    borderRadius: 14,
    backgroundColor: '#DBF5E8',
    borderWidth: 1,
    borderColor: '#A9E3C8',
    alignItems: 'center',
    paddingVertical: 10
  },
  challengeDone: {
    opacity: 0.7
  },
  challengeBtnText: {
    fontFamily: 'Poppins_700Bold',
    color: '#2C7960',
    fontSize: 13
  },
  actionBtn: {
    borderRadius: 16,
    backgroundColor: '#D6C7FF',
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBA5FF'
  },
  actionBtnText: {
    fontFamily: 'Poppins_700Bold',
    color: '#503F8A',
    fontSize: 14
  }
});
