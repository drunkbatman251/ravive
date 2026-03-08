import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { ScreenContainer } from '../components/ScreenContainer';
import { loginDemo } from '../store/authSlice';
import { colors } from '../theme/colors';

export function LoginScreen() {
  const dispatch = useDispatch();
  const status = useSelector((s) => s.auth.status);
  const error = useSelector((s) => s.auth.error);

  useEffect(() => {
    dispatch(loginDemo());
  }, [dispatch]);

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.center}>
        <LinearGradient colors={['#CFF6E7', '#DDF0FF']} style={styles.logoBubble}>
          <Text style={styles.logoBear}>🧸</Text>
        </LinearGradient>
        <Text style={styles.title}>Ravive</Text>
        <Text style={styles.subtitle}>Level up real life with cute daily quests</Text>

        <Pressable onPress={() => dispatch(loginDemo())} style={styles.button}>
          <Text style={styles.buttonText}>Enter Adventure</Text>
        </Pressable>

        {status === 'loading' ? <ActivityIndicator style={{ marginTop: 14 }} color="#43CDA2" /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  logoBubble: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFE3D4'
  },
  logoBear: { fontSize: 50 },
  title: {
    marginTop: 18,
    fontFamily: 'Poppins_700Bold',
    color: colors.text,
    fontSize: 34
  },
  subtitle: {
    marginTop: 8,
    fontFamily: 'Nunito_700Bold',
    color: colors.textSoft,
    fontSize: 15,
    textAlign: 'center'
  },
  button: {
    marginTop: 22,
    borderRadius: 18,
    backgroundColor: '#A8EED0',
    borderWidth: 1,
    borderColor: '#79D2AB',
    paddingHorizontal: 26,
    paddingVertical: 14
  },
  buttonText: {
    fontFamily: 'Poppins_700Bold',
    color: '#1C6A50',
    fontSize: 15
  },
  error: {
    marginTop: 10,
    color: '#B94D63',
    fontFamily: 'Nunito_700Bold'
  }
});
