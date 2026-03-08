import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

const SKIN = '#D89369';
const HAIR = '#1D2859';
const TOP = '#181818';
const SHORTS = '#FF5C42';
const LEG = '#A65A36';
const SHOE = '#161616';
const BG = '#EEF5FF';
const GROUND = '#CFDCF4';

function keyframes(animation) {
  const base = {
    bodyX: [0, 0, 0],
    bodyY: [0, 0, 0],
    torso: ['0deg', '5deg', '0deg'],
    armL: ['-18deg', '24deg', '-18deg'],
    armR: ['18deg', '-24deg', '18deg'],
    thighL: ['18deg', '-14deg', '18deg'],
    thighR: ['-18deg', '14deg', '-18deg'],
    shinL: ['-6deg', '8deg', '-6deg'],
    shinR: ['6deg', '-8deg', '6deg'],
    hipDrop: [0, 0, 0]
  };

  const map = {
    squat: {
      torso: ['0deg', '12deg', '0deg'],
      armL: ['-8deg', '16deg', '-8deg'],
      armR: ['8deg', '-16deg', '8deg'],
      thighL: ['10deg', '60deg', '10deg'],
      thighR: ['-10deg', '-60deg', '-10deg'],
      shinL: ['0deg', '-26deg', '0deg'],
      shinR: ['0deg', '26deg', '0deg'],
      hipDrop: [0, 16, 0]
    },
    lunge: {
      torso: ['0deg', '8deg', '0deg'],
      thighL: ['12deg', '56deg', '12deg'],
      shinL: ['0deg', '-20deg', '0deg'],
      thighR: ['-12deg', '16deg', '-12deg'],
      shinR: ['8deg', '-10deg', '8deg'],
      armL: ['-10deg', '18deg', '-10deg'],
      armR: ['12deg', '-14deg', '12deg'],
      hipDrop: [0, 9, 0]
    },
    plank: {
      bodyY: [13, 12, 13],
      torso: ['84deg', '82deg', '84deg'],
      armL: ['78deg', '86deg', '78deg'],
      armR: ['84deg', '78deg', '84deg'],
      thighL: ['-3deg', '-6deg', '-3deg'],
      thighR: ['3deg', '6deg', '3deg'],
      shinL: ['0deg', '0deg', '0deg'],
      shinR: ['0deg', '0deg', '0deg']
    },
    'bird-dog': {
      bodyY: [12, 12, 12],
      torso: ['84deg', '84deg', '84deg'],
      armL: ['16deg', '-56deg', '16deg'],
      armR: ['-36deg', '12deg', '-36deg'],
      thighL: ['-18deg', '36deg', '-18deg'],
      thighR: ['24deg', '-30deg', '24deg'],
      shinL: ['0deg', '0deg', '0deg'],
      shinR: ['0deg', '0deg', '0deg']
    },
    row: {
      torso: ['2deg', '10deg', '2deg'],
      armL: ['30deg', '-24deg', '30deg'],
      armR: ['-30deg', '24deg', '-30deg']
    },
    press: {
      armL: ['18deg', '-72deg', '18deg'],
      armR: ['-18deg', '72deg', '-18deg']
    },
    pushup: {
      bodyY: [11, 15, 11],
      torso: ['84deg', '84deg', '84deg'],
      armL: ['78deg', '58deg', '78deg'],
      armR: ['84deg', '58deg', '84deg']
    },
    'dead-bug': {
      bodyY: [13, 13, 13],
      torso: ['84deg', '84deg', '84deg'],
      armL: ['18deg', '-46deg', '18deg'],
      armR: ['-18deg', '46deg', '-18deg'],
      thighL: ['0deg', '36deg', '0deg'],
      thighR: ['0deg', '-36deg', '0deg']
    },
    'wall-sit': {
      torso: ['0deg', '0deg', '0deg'],
      thighL: ['58deg', '58deg', '58deg'],
      thighR: ['-58deg', '-58deg', '-58deg'],
      shinL: ['-24deg', '-24deg', '-24deg'],
      shinR: ['24deg', '24deg', '24deg'],
      armL: ['2deg', '2deg', '2deg'],
      armR: ['-2deg', '-2deg', '-2deg'],
      hipDrop: [12, 12, 12]
    },
    twist: {
      torso: ['-12deg', '12deg', '-12deg'],
      armL: ['-34deg', '34deg', '-34deg'],
      armR: ['34deg', '-34deg', '34deg']
    }
  };

  return { ...base, ...(map[animation] || {}) };
}

function useAnim(animation) {
  const value = useRef(new Animated.Value(0)).current;
  const frames = useMemo(() => keyframes(animation), [animation]);

  useEffect(() => {
    value.stopAnimation();
    value.setValue(0);
    const loop = Animated.loop(
      Animated.timing(value, {
        toValue: 1,
        duration: 2200,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true
      })
    );
    loop.start();
    return () => loop.stop();
  }, [animation, value]);

  const i = (part) =>
    value.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: frames[part]
    });

  return { i };
}

function Limb({ width, height, color, style, rotate }) {
  return (
    <Animated.View style={[style, { transform: [{ rotate }] }]}>
      <View style={[styles.segment, { width, height, backgroundColor: color }]} />
    </Animated.View>
  );
}

function MotionArrow({ up = false }) {
  return (
    <View style={styles.arrowBox}>
      <View style={[styles.arrowShaft, up ? styles.arrowUp : styles.arrowDown]} />
      <View style={[styles.arrowHead, up ? styles.arrowHeadUp : styles.arrowHeadDown]} />
    </View>
  );
}

export function StickFigureDemo({ animation = 'march' }) {
  const { i } = useAnim(animation);
  const isFloor = ['plank', 'bird-dog', 'dead-bug', 'pushup'].includes(animation);
  const tTop = isFloor ? 58 : 28;
  const hTop = isFloor ? 74 : 68;

  return (
    <View style={styles.wrap}>
      <View style={styles.bg} />
      <View style={styles.ground} />
      {(animation === 'squat' || animation === 'lunge') ? <MotionArrow up={animation === 'squat'} /> : null}

      <Animated.View style={[styles.avatar, { transform: [{ translateX: i('bodyX') }, { translateY: i('bodyY') }] }]}>
        <Animated.View style={[styles.headWrap, { top: isFloor ? 34 : 8, transform: [{ translateY: i('hipDrop') }] }]}>
          <View style={styles.hairBase} />
          <View style={styles.hairBun} />
          <View style={styles.head} />
          <View style={styles.hairFront} />
        </Animated.View>

        <Animated.View style={[styles.torsoWrap, { top: tTop, transform: [{ translateY: i('hipDrop') }, { rotate: i('torso') }] }]}>
          <View style={styles.neck} />
          <View style={styles.torso} />
          <View style={styles.shorts} />
        </Animated.View>

        <Limb width={9} height={31} color={SKIN} style={[styles.arm, styles.armL, { top: tTop + 8 }]} rotate={i('armL')} />
        <Limb width={9} height={31} color={SKIN} style={[styles.arm, styles.armR, { top: tTop + 8 }]} rotate={i('armR')} />

        <Limb width={11} height={29} color={SHORTS} style={[styles.thigh, styles.thighL, { top: hTop }]} rotate={i('thighL')} />
        <Limb width={11} height={29} color={SHORTS} style={[styles.thigh, styles.thighR, { top: hTop }]} rotate={i('thighR')} />

        <Limb width={11} height={30} color={LEG} style={[styles.shin, styles.shinL, { top: hTop + 24 }]} rotate={i('shinL')} />
        <Limb width={11} height={30} color={LEG} style={[styles.shin, styles.shinR, { top: hTop + 24 }]} rotate={i('shinR')} />

        <View style={[styles.shoe, styles.shoeL]} />
        <View style={[styles.shoe, styles.shoeR]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 132,
    height: 132,
    borderRadius: 18,
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: '#D6E6FF',
    overflow: 'hidden'
  },
  bg: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 54,
    left: 12,
    top: 10,
    backgroundColor: '#E2EEFF'
  },
  ground: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 20,
    height: 7,
    borderRadius: 7,
    backgroundColor: GROUND
  },
  arrowBox: {
    position: 'absolute',
    right: 8,
    top: 12,
    width: 16,
    height: 28,
    alignItems: 'center'
  },
  arrowShaft: {
    width: 3,
    height: 20,
    backgroundColor: '#7EA3DE'
  },
  arrowUp: { marginTop: 6 },
  arrowDown: { marginTop: 0 },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent'
  },
  arrowHeadUp: {
    borderBottomWidth: 7,
    borderBottomColor: '#7EA3DE',
    marginBottom: 1
  },
  arrowHeadDown: {
    borderTopWidth: 7,
    borderTopColor: '#7EA3DE',
    marginTop: 1
  },
  avatar: {
    position: 'absolute',
    left: 34,
    top: 2,
    width: 64,
    height: 126
  },
  headWrap: {
    position: 'absolute',
    left: 22,
    width: 22,
    height: 24,
    alignItems: 'center'
  },
  head: {
    width: 20,
    height: 22,
    borderRadius: 10,
    backgroundColor: SKIN,
    zIndex: 2
  },
  hairBase: {
    position: 'absolute',
    top: 1,
    width: 22,
    height: 10,
    borderRadius: 6,
    backgroundColor: HAIR,
    zIndex: 3
  },
  hairFront: {
    position: 'absolute',
    top: 0,
    left: 2,
    width: 14,
    height: 8,
    borderBottomRightRadius: 6,
    borderTopLeftRadius: 4,
    backgroundColor: HAIR,
    zIndex: 4
  },
  hairBun: {
    position: 'absolute',
    top: 8,
    right: -4,
    width: 9,
    height: 12,
    borderRadius: 5,
    backgroundColor: HAIR,
    zIndex: 1
  },
  torsoWrap: {
    position: 'absolute',
    left: 18,
    width: 28,
    alignItems: 'center'
  },
  neck: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SKIN
  },
  torso: {
    width: 26,
    height: 35,
    marginTop: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    backgroundColor: TOP
  },
  shorts: {
    width: 26,
    height: 15,
    marginTop: -1,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: SHORTS
  },
  arm: {
    position: 'absolute',
    alignItems: 'center',
    width: 9
  },
  armL: { left: 9 },
  armR: { right: 9 },
  thigh: {
    position: 'absolute',
    alignItems: 'center',
    width: 11
  },
  thighL: { left: 22 },
  thighR: { right: 22 },
  shin: {
    position: 'absolute',
    alignItems: 'center',
    width: 11
  },
  shinL: { left: 21 },
  shinR: { right: 21 },
  shoe: {
    position: 'absolute',
    width: 14,
    height: 6,
    borderRadius: 4,
    backgroundColor: SHOE,
    bottom: 18
  },
  shoeL: { left: 18 },
  shoeR: { right: 18 },
  segment: { borderRadius: 9 }
});
