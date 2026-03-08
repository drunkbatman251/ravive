import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../api/client';
import { GlassCard } from '../components/GlassCard';
import { QuickChips } from '../components/QuickChips';
import { ScreenContainer } from '../components/ScreenContainer';
import { TitleBar } from '../components/TitleBar';
import { fetchDashboard, pushNotification, toggleSound } from '../store/appSlice';
import { logout } from '../store/authSlice';
import { colors } from '../theme/colors';

const goalOptions = [
  { label: 'Lose Fat', value: 'lose_fat' },
  { label: 'Maintain', value: 'maintain' },
  { label: 'Gain Muscle', value: 'gain_muscle' }
];

export function ProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const soundEnabled = useSelector((s) => s.app.soundEnabled);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [goal, setGoal] = useState('maintain');
  const [targetWeightChangeKg, setTargetWeightChangeKg] = useState('0');
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [equipmentPreferences, setEquipmentPreferences] = useState([]);

  async function loadProfile() {
    setLoading(true);
    try {
      const response = await api.get('/profile');
      const data = response.data;
      setProfile(data);
      setRecommendations(data.recommendations || []);

      setName(data.user?.name || '');
      setAge(String(data.user?.age || ''));
      setWeightKg(String(data.user?.weight_kg || ''));
      setHeightCm(String(data.user?.height_cm || ''));
      setGoal(data.user?.goal || 'maintain');
      setTargetWeightChangeKg(String(data.user?.target_weight_change_kg || 0));
      setEquipmentOptions(data.equipmentOptions || []);
      setEquipmentPreferences(data.user?.equipment_preferences || []);
    } catch {
      dispatch(pushNotification('Could not load profile.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
    dispatch(fetchDashboard());
  }, [dispatch]);

  async function saveProfile() {
    setSaving(true);
    try {
      const maybeNumber = (value) => {
        const n = Number(value);
        return Number.isFinite(n) ? n : undefined;
      };

      await api.put('/profile', {
        name,
        age: maybeNumber(age),
        weightKg: maybeNumber(weightKg),
        heightCm: maybeNumber(heightCm),
        goal,
        targetWeightChangeKg: maybeNumber(targetWeightChangeKg),
        equipmentPreferences
      });

      await loadProfile();
      dispatch(fetchDashboard());
      dispatch(pushNotification('Profile updated. Great job staying consistent!'));
    } catch {
      dispatch(pushNotification('Could not save profile. Please check values.'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator color="#43CDA2" />
      </ScreenContainer>
    );
  }

  const bmi = profile?.bmi || 0;
  const bmiStatus = profile?.bmiStatus || 'Unknown';
  const shouldUpdateWeight = profile?.shouldUpdateWeight;
  const level = profile?.user?.level || 1;
  const avatar = level >= 20 ? '🦸‍♀️' : level >= 10 ? '🏃‍♀️' : '🙂';

  function toggleEquipment(item) {
    setEquipmentPreferences((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  }

  return (
    <ScreenContainer>
      <TitleBar title="Profile" subtitle="Your personal health mission" />

      <GlassCard>
        <Text style={styles.sectionTitle}>Avatar Evolution</Text>
        <View style={styles.avatarRow}>
          <Text style={styles.avatarIcon}>{avatar}</Text>
          <View>
            <Text style={styles.avatarTitle}>Level {level} Hero</Text>
            <Text style={styles.avatarSub}>More workouts + sleep consistency evolve your avatar.</Text>
          </View>
        </View>
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Personal Info</Text>
        <View style={styles.row2}>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Name</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} />
          </View>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Age</Text>
            <TextInput value={age} onChangeText={setAge} keyboardType="numeric" style={styles.input} />
          </View>
        </View>

        <View style={styles.row2}>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput value={weightKg} onChangeText={setWeightKg} keyboardType="decimal-pad" style={styles.input} />
          </View>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput value={heightCm} onChangeText={setHeightCm} keyboardType="decimal-pad" style={styles.input} />
          </View>
        </View>

        <View style={styles.bmiCard}>
          <Text style={styles.bmiTitle}>BMI {bmi} • {bmiStatus}</Text>
          <Text style={styles.bmiText}>Calculated from your latest height and weight.</Text>
        </View>

        {shouldUpdateWeight ? (
          <View style={styles.reminder}>
            <Text style={styles.reminderText}>Reminder: update your weight this week for accurate plans.</Text>
          </View>
        ) : null}
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Goal Plan</Text>
        <QuickChips options={goalOptions} selected={goal} onSelect={setGoal} />
        <Text style={[styles.label, { marginTop: 10 }]}>Target Weight Change (kg)</Text>
        <TextInput
          value={targetWeightChangeKg}
          onChangeText={setTargetWeightChangeKg}
          keyboardType="decimal-pad"
          style={styles.input}
          placeholder="e.g. -5 for fat loss or +3 for muscle gain"
          placeholderTextColor="#8EA1BF"
        />
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Fitness Settings (Equipment)</Text>
        <View style={styles.equipmentWrap}>
          {equipmentOptions.map((item) => {
            const active = equipmentPreferences.includes(item);
            return (
              <Pressable
                key={item}
                onPress={() => toggleEquipment(item)}
                style={[styles.eqChip, active ? styles.eqChipActive : null]}
              >
                <Text style={[styles.eqText, active ? styles.eqTextActive : null]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Recommended Exercises</Text>
        {recommendations.map((item) => (
          <View key={item.id} style={styles.recoItem}>
            <Text style={styles.recoTitle}>{item.name}</Text>
            <Text style={styles.recoMeta}>{item.category} • {item.difficulty} • {item.calories_burned_per_30min} kcal/30m</Text>
          </View>
        ))}
      </GlassCard>

      <Pressable onPress={saveProfile} style={[styles.primaryBtn, saving ? styles.disabled : null]} disabled={saving}>
        <Text style={styles.primaryText}>{saving ? 'Saving...' : 'Save Profile'}</Text>
      </Pressable>

      <Pressable onPress={() => dispatch(toggleSound())} style={styles.soundBtn}>
        <Text style={styles.soundText}>Sound Effects: {soundEnabled ? 'On' : 'Off'}</Text>
      </Pressable>

      <Pressable onPress={() => dispatch(logout())} style={styles.secondaryBtn}>
        <Text style={styles.secondaryText}>Logout</Text>
      </Pressable>

      <Text style={styles.email}>Logged in as {user?.email}</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    color: colors.text,
    fontSize: 16,
    marginBottom: 10
  },
  row2: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8
  },
  fieldHalf: {
    flex: 1
  },
  label: {
    color: colors.textSoft,
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    marginBottom: 4
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFE8F7',
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontFamily: 'Nunito_700Bold',
    color: colors.text
  },
  bmiCard: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#E6F9F1',
    borderWidth: 1,
    borderColor: '#B9EED8',
    padding: 10
  },
  bmiTitle: {
    fontFamily: 'Poppins_700Bold',
    color: '#2B755B',
    fontSize: 14
  },
  bmiText: {
    marginTop: 2,
    color: '#4A8A75',
    fontFamily: 'Nunito_700Bold',
    fontSize: 12
  },
  reminder: {
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: '#FFF1DD',
    borderWidth: 1,
    borderColor: '#F8D5A8',
    padding: 10
  },
  reminderText: {
    color: '#915E22',
    fontFamily: 'Nunito_700Bold',
    fontSize: 12
  },
  recoItem: {
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EEFA',
    padding: 9
  },
  recoTitle: {
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    fontSize: 13
  },
  recoMeta: {
    marginTop: 2,
    color: colors.textSoft,
    fontFamily: 'Nunito_700Bold',
    fontSize: 12
  },
  primaryBtn: {
    borderRadius: 16,
    backgroundColor: '#D9EBFF',
    borderWidth: 1,
    borderColor: '#B7D6FF',
    alignItems: 'center',
    paddingVertical: 14
  },
  disabled: {
    opacity: 0.7
  },
  primaryText: {
    fontFamily: 'Poppins_700Bold',
    color: '#3E618C',
    fontSize: 14
  },
  soundBtn: {
    borderRadius: 16,
    backgroundColor: '#EDEBFF',
    borderWidth: 1,
    borderColor: '#D0C7FF',
    alignItems: 'center',
    paddingVertical: 14
  },
  soundText: {
    fontFamily: 'Poppins_700Bold',
    color: '#5C4AA0',
    fontSize: 14
  },
  secondaryBtn: {
    borderRadius: 16,
    backgroundColor: '#FFE2E6',
    borderWidth: 1,
    borderColor: '#F7C2CB',
    alignItems: 'center',
    paddingVertical: 14
  },
  secondaryText: {
    fontFamily: 'Poppins_700Bold',
    color: '#A84F5E',
    fontSize: 14
  },
  email: {
    textAlign: 'center',
    color: '#7B8BA7',
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    marginTop: 2
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  avatarIcon: {
    fontSize: 40
  },
  avatarTitle: {
    fontFamily: 'Poppins_700Bold',
    color: colors.text,
    fontSize: 14
  },
  avatarSub: {
    marginTop: 2,
    fontFamily: 'Nunito_700Bold',
    color: colors.textSoft,
    fontSize: 12
  },
  equipmentWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  eqChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#DFE8F7',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  eqChipActive: {
    backgroundColor: '#D9EEFF',
    borderColor: '#A7D2FF'
  },
  eqText: {
    fontFamily: 'Nunito_700Bold',
    color: colors.textSoft,
    fontSize: 12
  },
  eqTextActive: {
    color: '#2F5F91'
  }
});
