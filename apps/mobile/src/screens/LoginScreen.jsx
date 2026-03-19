import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { ScreenContainer } from '../components/ScreenContainer';
import { loginDemo, loginUser, registerUser } from '../store/authSlice';
import { colors } from '../theme/colors';

export function LoginScreen() {
  const dispatch = useDispatch();
  const [mode, setMode] = useState('login');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const status = useSelector((s) => s.auth.status);
  const error = useSelector((s) => s.auth.error);

  const busy = status === 'loading';
  const buttonLabel = useMemo(() => (mode === 'login' ? 'Log In' : 'Create Account'), [mode]);

  const submit = () => {
    if (!loginId.trim() || !password) return;
    if (mode === 'login') {
      dispatch(loginUser({ loginId: loginId.trim(), password }));
      return;
    }
    dispatch(registerUser({ loginId: loginId.trim(), password }));
  };

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.center}>
        <LinearGradient colors={['#CFF6E7', '#DDF0FF']} style={styles.logoBubble}>
          <Text style={styles.logoBear}>🧸</Text>
        </LinearGradient>
        <Text style={styles.title}>Ravive</Text>
        <Text style={styles.subtitle}>Level up real life with cute daily quests</Text>

        <View style={styles.modeWrap}>
          <Pressable onPress={() => setMode('login')} style={[styles.modeBtn, mode === 'login' ? styles.modeBtnActive : null]}>
            <Text style={[styles.modeText, mode === 'login' ? styles.modeTextActive : null]}>Log In</Text>
          </Pressable>
          <Pressable onPress={() => setMode('register')} style={[styles.modeBtn, mode === 'register' ? styles.modeBtnActive : null]}>
            <Text style={[styles.modeText, mode === 'register' ? styles.modeTextActive : null]}>Register</Text>
          </Pressable>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Login ID</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            editable={!busy}
            onChangeText={setLoginId}
            placeholder="Choose any unique login ID"
            placeholderTextColor="#90A0BA"
            style={styles.input}
            value={loginId}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            autoCapitalize="none"
            editable={!busy}
            onChangeText={setPassword}
            placeholder="Type any password"
            placeholderTextColor="#90A0BA"
            secureTextEntry
            style={styles.input}
            value={password}
          />

          <Pressable disabled={busy || !loginId.trim() || !password} onPress={submit} style={[styles.button, busy || !loginId.trim() || !password ? styles.buttonDisabled : null]}>
            <Text style={styles.buttonText}>{buttonLabel}</Text>
          </Pressable>

          <Pressable disabled={busy} onPress={() => dispatch(loginDemo())} style={styles.demoBtn}>
            <Text style={styles.demoText}>Try Demo Account</Text>
          </Pressable>
        </View>

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
  modeWrap: {
    marginTop: 20,
    flexDirection: 'row',
    backgroundColor: '#EFF7FF',
    borderRadius: 18,
    padding: 4
  },
  modeBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14
  },
  modeBtnActive: {
    backgroundColor: '#FFFFFF'
  },
  modeText: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#7A8AA6'
  },
  modeTextActive: {
    color: '#22405B'
  },
  formCard: {
    width: '100%',
    maxWidth: 360,
    marginTop: 16,
    backgroundColor: '#FFFFFFD8',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DCE8F8'
  },
  label: {
    fontFamily: 'Nunito_700Bold',
    color: colors.text,
    fontSize: 13,
    marginBottom: 6
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7E6F5',
    backgroundColor: '#F8FBFF',
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontFamily: 'Nunito_700Bold',
    color: colors.text,
    marginBottom: 12
  },
  button: {
    marginTop: 4,
    borderRadius: 18,
    backgroundColor: '#A8EED0',
    borderWidth: 1,
    borderColor: '#79D2AB',
    paddingHorizontal: 26,
    paddingVertical: 14
  },
  buttonDisabled: {
    opacity: 0.55
  },
  buttonText: {
    fontFamily: 'Poppins_700Bold',
    color: '#1C6A50',
    fontSize: 15
  },
  demoBtn: {
    alignSelf: 'center',
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  demoText: {
    fontFamily: 'Nunito_700Bold',
    color: '#55749B',
    fontSize: 13
  },
  error: {
    marginTop: 10,
    color: '#B94D63',
    fontFamily: 'Nunito_700Bold'
  }
});
