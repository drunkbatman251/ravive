import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { GlassCard } from '../components/GlassCard';
import { ScreenContainer } from '../components/ScreenContainer';
import { TitleBar } from '../components/TitleBar';
import { fetchAchievements, showMascotEvent } from '../store/appSlice';
import { colors } from '../theme/colors';

export function AchievementsScreen() {
  const dispatch = useDispatch();
  const achievements = useSelector((s) => s.app.achievements);

  useEffect(() => {
    dispatch(fetchAchievements()).then((result) => {
      const unlockedNow = result.payload?.unlockedNow || [];
      if (unlockedNow.length) {
        dispatch(showMascotEvent({
          type: 'achievement',
          xp: unlockedNow.reduce((sum, a) => sum + Number(a.xp_reward || 0), 0),
          message: 'Achievement unlocked! Your bear buddy is celebrating!'
        }));
      }
    });
  }, [dispatch]);

  return (
    <ScreenContainer>
      <TitleBar title="Achievement Party" subtitle="Collect badges and sparkle" />
      {achievements.map((a) => (
        <GlassCard key={a.code} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>{a.unlocked_at ? '🏆' : '🔒'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{a.title}</Text>
              <Text style={styles.desc}>{a.description}</Text>
            </View>
            <Text style={[styles.badge, a.unlocked_at ? styles.on : styles.off]}>
              {a.unlocked_at ? 'Unlocked' : 'Locked'}
            </Text>
          </View>
        </GlassCard>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF3D5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: { fontSize: 22 },
  title: {
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    fontSize: 14
  },
  desc: {
    color: colors.textSoft,
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    marginTop: 2
  },
  badge: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden'
  },
  on: {
    color: '#2C7C60',
    backgroundColor: '#CEF2E3'
  },
  off: {
    color: '#7A86A1',
    backgroundColor: '#EEF2FA'
  }
});
