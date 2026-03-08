import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { clearMascotEvent } from '../store/appSlice';
import { colors } from '../theme/colors';
import {
  playAchievementSound,
  playXpGainSound,
  playXpLossSound,
  setSoundEnabled
} from '../utils/soundEffects';

function BearFace({ mode = 'happy' }) {
  const isSad = mode === 'sad';

  return (
    <View style={styles.bearWrap}>
      <View style={[styles.ear, styles.earLeft]} />
      <View style={[styles.ear, styles.earRight]} />
      <View style={[styles.face, isSad ? { backgroundColor: '#F2C5A5' } : null]}>
        <View style={styles.eyeRow}>
          <View style={styles.eye} />
          <View style={styles.eye} />
        </View>
        <View style={styles.snout}>
          <View style={styles.nose} />
          <View style={[styles.mouth, isSad ? styles.mouthSad : styles.mouthHappy]} />
        </View>
        {isSad ? <Text style={styles.tear}>💧</Text> : null}
      </View>
    </View>
  );
}

function FloatingXp({ xp }) {
  const y = useSharedValue(12);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withSequence(withTiming(1, { duration: 150 }), withDelay(700, withTiming(0, { duration: 300 })));
    y.value = withTiming(-24, { duration: 900 });
  }, [xp]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }], opacity: opacity.value }));

  return <Animated.Text style={[styles.floatingXp, style]}>{xp > 0 ? `+${xp} XP` : `${xp} XP`}</Animated.Text>;
}

function ConfettiBurst() {
  const p1 = useSharedValue(0);
  const p2 = useSharedValue(0);
  const p3 = useSharedValue(0);

  useEffect(() => {
    p1.value = withTiming(1, { duration: 900 });
    p2.value = withTiming(1, { duration: 900 });
    p3.value = withTiming(1, { duration: 900 });
  }, []);

  const s1 = useAnimatedStyle(() => ({ opacity: 1 - p1.value, transform: [{ translateY: p1.value * -70 }, { translateX: p1.value * -40 }] }));
  const s2 = useAnimatedStyle(() => ({ opacity: 1 - p2.value, transform: [{ translateY: p2.value * -85 }, { translateX: p2.value * 20 }] }));
  const s3 = useAnimatedStyle(() => ({ opacity: 1 - p3.value, transform: [{ translateY: p3.value * -65 }, { translateX: p3.value * 55 }] }));

  return (
    <>
      <Animated.Text style={[styles.confetti, styles.c1, s1]}>🎉</Animated.Text>
      <Animated.Text style={[styles.confetti, styles.c2, s2]}>✨</Animated.Text>
      <Animated.Text style={[styles.confetti, styles.c3, s3]}>🎊</Animated.Text>
    </>
  );
}

export function MascotOverlay() {
  const dispatch = useDispatch();
  const event = useSelector((s) => s.app.mascotEvent);
  const soundEnabled = useSelector((s) => s.app.soundEnabled);
  const bob = useSharedValue(0);

  useEffect(() => {
    setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    if (!event) return;

    if (event.type === 'loss') {
      playXpLossSound();
      bob.value = withSequence(
        withTiming(-10, { duration: 80 }),
        withTiming(10, { duration: 80 }),
        withTiming(-8, { duration: 70 }),
        withTiming(8, { duration: 70 }),
        withTiming(0, { duration: 120 })
      );
    } else if (event.type === 'achievement') {
      playAchievementSound();
      bob.value = withRepeat(withSequence(withSpring(-16), withSpring(0)), 4, false);
    } else {
      playXpGainSound();
      bob.value = withRepeat(withSequence(withSpring(-12), withSpring(0)), 3, false);
    }

    const timeout = setTimeout(() => dispatch(clearMascotEvent()), 2600);
    return () => clearTimeout(timeout);
  }, [event?.id]);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }, { translateX: event?.type === 'loss' ? bob.value : 0 }]
  }));

  if (!event) return null;

  const positive = event.type !== 'loss';

  return (
    <Modal transparent animationType="fade" visible>
      <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.backdrop}>
        <Pressable style={styles.scrim} onPress={() => dispatch(clearMascotEvent())} />
        <View style={styles.content}>
          {event.type === 'achievement' ? <ConfettiBurst /> : null}
          <Animated.View style={mascotStyle}>
            <BearFace mode={positive ? 'happy' : 'sad'} />
          </Animated.View>
          <Text style={styles.title}>{positive ? 'Yay! Great move!' : 'Oh no, tiny setback'}</Text>
          <FloatingXp xp={event.xp || 0} />
          <Text style={styles.message}>{event.message}</Text>
          {event.recovery ? <Text style={styles.recovery}>Recovery quest: {event.recovery}</Text> : null}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20,30,50,0.2)'
  },
  content: {
    width: '86%',
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#FFFDFD',
    borderWidth: 1,
    borderColor: '#E8EEF7',
    alignItems: 'center',
    overflow: 'hidden'
  },
  bearWrap: {
    width: 120,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ear: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D89C73',
    top: 12
  },
  earLeft: { left: 20 },
  earRight: { right: 20 },
  face: {
    width: 88,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#E9AF83',
    alignItems: 'center',
    justifyContent: 'center'
  },
  eyeRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4
  },
  eye: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3E2A22'
  },
  snout: {
    marginTop: 8,
    width: 34,
    height: 22,
    borderRadius: 12,
    backgroundColor: '#F5D5BD',
    alignItems: 'center',
    justifyContent: 'center'
  },
  nose: {
    width: 10,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#52362C'
  },
  mouth: {
    marginTop: 3,
    width: 14,
    borderColor: '#52362C',
    borderBottomWidth: 2
  },
  mouthHappy: {
    borderRadius: 10
  },
  mouthSad: {
    transform: [{ rotate: '180deg' }],
    borderRadius: 10
  },
  tear: {
    position: 'absolute',
    right: 16,
    top: 40,
    fontSize: 13
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#253654',
    marginTop: 8
  },
  floatingXp: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: colors.success,
    marginTop: 2
  },
  message: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#4F6282',
    textAlign: 'center',
    marginTop: 6
  },
  recovery: {
    marginTop: 6,
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: '#6A5FA6',
    textAlign: 'center'
  },
  confetti: {
    position: 'absolute',
    top: 18,
    fontSize: 22
  },
  c1: { left: 38 },
  c2: { left: 92 },
  c3: { left: 146 }
});
