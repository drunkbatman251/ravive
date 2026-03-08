import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useDispatch, useSelector } from 'react-redux';
import { GlassCard } from '../components/GlassCard';
import { ScreenContainer } from '../components/ScreenContainer';
import { TitleBar } from '../components/TitleBar';
import {
  createSocialChallenge,
  fetchSocialOverview,
  joinSocialChallenge,
  pushNotification,
  respondFriendRequest,
  sendFriendRequest,
  showMascotEvent
} from '../store/appSlice';
import { colors } from '../theme/colors';

export function SocialScreen() {
  const dispatch = useDispatch();
  const social = useSelector((s) => s.app.social);
  const [friendCode, setFriendCode] = useState('');

  useEffect(() => {
    dispatch(fetchSocialOverview());
  }, [dispatch]);

  async function onSendRequest() {
    if (!friendCode.trim()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await dispatch(sendFriendRequest(friendCode.trim().toUpperCase())).unwrap();
      setFriendCode('');
      dispatch(fetchSocialOverview());
      dispatch(showMascotEvent({ type: 'gain', xp: 0, message: 'Friend request sent!' }));
    } catch {
      dispatch(pushNotification('Could not send friend request.'));
    }
  }

  async function onRespond(requestId, action) {
    try {
      await dispatch(respondFriendRequest({ requestId, action })).unwrap();
      dispatch(fetchSocialOverview());
      if (action === 'accept') {
        dispatch(showMascotEvent({ type: 'achievement', xp: 30, message: 'New friend joined your journey!' }));
      }
    } catch {
      dispatch(pushNotification('Could not respond to friend request.'));
    }
  }

  async function onCreateChallenge() {
    try {
      await dispatch(createSocialChallenge({ title: '7 Day XP Sprint', targetXp: 500, durationDays: 7 })).unwrap();
      dispatch(fetchSocialOverview());
    } catch {
      dispatch(pushNotification('Could not create challenge right now.'));
    }
  }

  async function onJoin(challengeId) {
    try {
      await dispatch(joinSocialChallenge(challengeId)).unwrap();
      dispatch(fetchSocialOverview());
    } catch {
      dispatch(pushNotification('Could not join this challenge right now.'));
    }
  }

  return (
    <ScreenContainer>
      <TitleBar title="Social Arena" subtitle="Compete free with friends" />

      <GlassCard>
        <Text style={styles.sectionTitle}>Your Friend Code</Text>
        <Text style={styles.friendCode}>{social?.me?.friendCode || 'Loading...'}</Text>
        <Text style={styles.help}>Share this code. Your friend enters it to connect.</Text>
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Add Friend</Text>
        <View style={styles.row}>
          <TextInput
            value={friendCode}
            onChangeText={setFriendCode}
            placeholder="Enter friend code"
            placeholderTextColor="#8DA0BF"
            style={styles.input}
          />
          <Pressable style={styles.addBtn} onPress={onSendRequest}>
            <Text style={styles.addBtnText}>Send</Text>
          </Pressable>
        </View>
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Incoming Requests</Text>
        {!social?.incomingRequests?.length ? <Text style={styles.help}>No pending requests.</Text> : null}
        {social?.incomingRequests?.map((request) => (
          <View key={request.id} style={styles.requestRow}>
            <Text style={styles.requestName}>{request.name} ({request.friend_code})</Text>
            <View style={styles.reqBtns}>
              <Pressable style={styles.accept} onPress={() => onRespond(request.id, 'accept')}>
                <Text style={styles.acceptText}>Accept</Text>
              </Pressable>
              <Pressable style={styles.reject} onPress={() => onRespond(request.id, 'reject')}>
                <Text style={styles.rejectText}>Reject</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Weekly Leaderboard</Text>
        {social?.leaderboard?.map((item, idx) => (
          <View key={item.id} style={styles.leaderRow}>
            <Text style={styles.rank}>#{idx + 1}</Text>
            <Text style={styles.requestName}>{item.name}</Text>
            <Text style={styles.xp}>{item.weekly_xp} XP</Text>
          </View>
        ))}
      </GlassCard>

      <GlassCard>
        <View style={styles.challengeHeader}>
          <Text style={styles.sectionTitle}>Challenges</Text>
          <Pressable style={styles.newChallenge} onPress={onCreateChallenge}>
            <Text style={styles.newChallengeText}>New 7-Day Challenge</Text>
          </Pressable>
        </View>

        {social?.challenges?.map((challenge) => (
          <View key={challenge.id} style={styles.challengeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.requestName}>{challenge.title}</Text>
              <Text style={styles.help}>Target {challenge.target_xp} XP • by {challenge.creator_name}</Text>
            </View>
            {challenge.joined ? (
              <Text style={styles.joined}>Joined</Text>
            ) : (
              <Pressable style={styles.joinBtn} onPress={() => onJoin(challenge.id)}>
                <Text style={styles.joinBtnText}>Join</Text>
              </Pressable>
            )}
          </View>
        ))}
      </GlassCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    color: colors.text,
    fontSize: 16,
    marginBottom: 8
  },
  friendCode: {
    fontFamily: 'Poppins_700Bold',
    color: '#3E628E',
    fontSize: 24,
    letterSpacing: 1
  },
  help: {
    color: colors.textSoft,
    fontFamily: 'Nunito_700Bold',
    fontSize: 12
  },
  row: {
    flexDirection: 'row',
    gap: 8
  },
  input: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE8F7',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Nunito_700Bold',
    color: colors.text
  },
  addBtn: {
    borderRadius: 12,
    backgroundColor: '#CFF5E7',
    borderWidth: 1,
    borderColor: '#8FD8BA',
    paddingHorizontal: 14,
    justifyContent: 'center'
  },
  addBtnText: {
    fontFamily: 'Poppins_700Bold',
    color: '#2A745A'
  },
  requestRow: {
    marginTop: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EDFA',
    padding: 10,
    gap: 8
  },
  requestName: {
    fontFamily: 'Nunito_700Bold',
    color: colors.text,
    fontSize: 14
  },
  reqBtns: {
    flexDirection: 'row',
    gap: 8
  },
  accept: {
    borderRadius: 10,
    backgroundColor: '#D7F5E8',
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  reject: {
    borderRadius: 10,
    backgroundColor: '#FFE2E7',
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  acceptText: {
    color: '#2E7A5E',
    fontFamily: 'Nunito_700Bold'
  },
  rejectText: {
    color: '#A95967',
    fontFamily: 'Nunito_700Bold'
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EEFA',
    paddingHorizontal: 10,
    paddingVertical: 9
  },
  rank: {
    width: 34,
    fontFamily: 'Poppins_700Bold',
    color: '#6E56B8'
  },
  xp: {
    marginLeft: 'auto',
    fontFamily: 'Poppins_700Bold',
    color: '#2E7D64'
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  newChallenge: {
    marginLeft: 'auto',
    borderRadius: 999,
    backgroundColor: '#E5D8FF',
    paddingHorizontal: 11,
    paddingVertical: 6
  },
  newChallengeText: {
    fontFamily: 'Nunito_700Bold',
    color: '#6244A4',
    fontSize: 11
  },
  challengeRow: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EEFA',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  joinBtn: {
    borderRadius: 10,
    backgroundColor: '#D8E8FF',
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  joinBtnText: {
    fontFamily: 'Nunito_700Bold',
    color: '#446FA7'
  },
  joined: {
    fontFamily: 'Nunito_700Bold',
    color: '#2E7A5E',
    backgroundColor: '#D7F5E8',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7
  }
});
