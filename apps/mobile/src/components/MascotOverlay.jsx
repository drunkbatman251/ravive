import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
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
  const y = useRef(new Animated.Value(12)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    y.setValue(12);
    opacity.setValue(0);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.delay(700),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true })
      ]),
      Animated.timing(y, {
        toValue: -24,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      })
    ]).start();
  }, [opacity, xp, y]);

  return (
    <Animated.Text style={[styles.floatingXp, { opacity, transform: [{ translateY: y }] }]}>
      {xp > 0 ? `+${xp} XP` : `${xp} XP`}
    </Animated.Text>
  );
}

function ConfettiBurst() {
  const p1 = useRef(new Animated.Value(0)).current;
  const p2 = useRef(new Animated.Value(0)).current;
  const p3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(p1, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(p2, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(p3, { toValue: 1, duration: 900, useNativeDriver: true })
    ]).start();
  }, [p1, p2, p3]);

  return (
    <>
      <Animated.Text style={[styles.confetti, styles.c1, { opacity: p1.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), transform: [{ translateY: p1.interpolate({ inputRange: [0, 1], outputRange: [0, -70] }) }, { translateX: p1.interpolate({ inputRange: [0, 1], outputRange: [0, -40] }) }] }]}>🎉</Animated.Text>
      <Animated.Text style={[styles.confetti, styles.c2, { opacity: p2.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), transform: [{ translateY: p2.interpolate({ inputRange: [0, 1], outputRange: [0, -85] }) }, { translateX: p2.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }] }]}>✨</Animated.Text>
      <Animated.Text style={[styles.confetti, styles.c3, { opacity: p3.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), transform: [{ translateY: p3.interpolate({ inputRange: [0, 1], outputRange: [0, -65] }) }, { translateX: p3.interpolate({ inputRange: [0, 1], outputRange: [0, 55] }) }] }]}>🎊</Animated.Text>
    </>
  );
}

export function MascotOverlay() {
  const dispatch = useDispatch();
  const event = useSelector((s) => s.app.mascotEvent);
  const soundEnabled = useSelector((s) => s.app.soundEnabled);
  const bobY = useRef(new Animated.Value(0)).current;
  const bobX = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    if (!event) return;

    overlayOpacity.setValue(0);
    bobY.setValue(0);
    bobX.setValue(0);
    Animated.timing(overlayOpacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();

    if (event.type === 'loss') {
      playXpLossSound();
      Animated.sequence([
        Animated.timing(bobX, { toValue: -10, duration: 80, useNativeDriver: true }),
        Animated.timing(bobX, { toValue: 10, duration: 80, useNativeDriver: true }),
        Animated.timing(bobX, { toValue: -8, duration: 70, useNativeDriver: true }),
        Animated.timing(bobX, { toValue: 8, duration: 70, useNativeDriver: true }),
        Animated.timing(bobX, { toValue: 0, duration: 120, useNativeDriver: true })
      ]).start();
    } else if (event.type === 'achievement') {
      playAchievementSound();
      Animated.loop(
        Animated.sequence([
          Animated.spring(bobY, { toValue: -16, useNativeDriver: true }),
          Animated.spring(bobY, { toValue: 0, useNativeDriver: true })
        ]),
        { iterations: 4 }
      ).start();
    } else {
      playXpGainSound();
      Animated.loop(
        Animated.sequence([
          Animated.spring(bobY, { toValue: -12, useNativeDriver: true }),
          Animated.spring(bobY, { toValue: 0, useNativeDriver: true })
        ]),
        { iterations: 3 }
      ).start();
    }

    const timeout = setTimeout(() => dispatch(clearMascotEvent()), 2600);
    return () => clearTimeout(timeout);
  }, [bobX, bobY, dispatch, event, overlayOpacity]);

  if (!event) return null;

  const positive = event.type !== 'loss';

  return (
    <Modal transparent animationType="fade" visible>
      <Animated.View style={[styles.backdrop, { opacity: overlayOpacity }]}>
        <Pressable style={styles.scrim} onPress={() => dispatch(clearMascotEvent())} />
        <View style={styles.content}>
          {event.type === 'achievement' ? <ConfettiBurst /> : null}
          <Animated.View style={{ transform: [{ translateY: bobY }, { translateX: bobX }] }}>
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
