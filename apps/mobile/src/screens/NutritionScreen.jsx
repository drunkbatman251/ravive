import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../api/client';
import { BouncyCard } from '../components/BouncyCard';
import { GlassCard } from '../components/GlassCard';
import { ScreenContainer } from '../components/ScreenContainer';
import { TitleBar } from '../components/TitleBar';
import {
  fetchDashboard,
  fetchFoodItems,
  fetchRecentMeals,
  pushNotification,
  showMascotEvent
} from '../store/appSlice';
import { colors } from '../theme/colors';

const iconByCategory = {
  'Indian Meal': '🍲',
  'Indian Breakfast': '🥣',
  'Street Food': '🍟',
  Beverages: '🥤',
  'Indian Foods': '🍛'
};

export function NutritionScreen() {
  const dispatch = useDispatch();
  const foods = useSelector((s) => s.app.foods);
  const recentMeals = useSelector((s) => s.app.recentMeals);
  const [selectedId, setSelectedId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [query, setQuery] = useState('');
  const [logging, setLogging] = useState(false);
  const [showAllMeals, setShowAllMeals] = useState(false);
  const [daily, setDaily] = useState(null);

  async function loadDailyNutrition() {
    try {
      const response = await api.get('/nutrition/daily');
      setDaily(response.data);
    } catch {
      setDaily(null);
    }
  }

  useEffect(() => {
    dispatch(fetchFoodItems());
    dispatch(fetchRecentMeals());
    loadDailyNutrition();
  }, [dispatch]);

  const filteredFoods = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const source = normalized
      ? foods.filter((item) => item.name.toLowerCase().includes(normalized))
      : foods;

    const limit = showAllMeals ? 18 : 9;
    return source.slice(0, limit);
  }, [foods, query, showAllMeals]);

  const selectedFood = useMemo(() => {
    return foods.find((item) => item.id === selectedId) || filteredFoods[0] || recentMeals[0] || null;
  }, [foods, filteredFoods, selectedId, recentMeals]);

  useEffect(() => {
    if (!selectedId && selectedFood) {
      setSelectedId(selectedFood.id);
    }
  }, [selectedFood, selectedId]);

  async function logMeal() {
    if (!selectedFood || logging) return;

    setLogging(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const response = await api.post('/nutrition/meals', { foodItemId: selectedFood.id, quantity });

      dispatch(fetchDashboard());
      dispatch(fetchRecentMeals());
      loadDailyNutrition();

      const xpChange = response.data?.xpEvent?.xp_change || 0;
      const suggestion = response.data?.recoverySuggestion;

      dispatch(showMascotEvent({
        type: xpChange >= 0 ? 'gain' : 'loss',
        xp: xpChange,
        message: xpChange >= 0
          ? `${selectedFood.name} logged. Nice fueling!`
          : 'That choice reduced your XP a little.',
        recovery: suggestion || null
      }));

      if (suggestion) dispatch(pushNotification(suggestion));
    } catch (error) {
      dispatch(pushNotification('Could not log meal. Please check connection and retry.'));
    } finally {
      setLogging(false);
    }
  }

  return (
    <ScreenContainer>
      <TitleBar title="Food Quest" subtitle="Search meal, tap once, done" />

      <GlassCard>
        <Text style={styles.sectionTitle}>Search Meals</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search Indian meals..."
          placeholderTextColor="#8EA1BF"
          autoCorrect={false}
          style={styles.searchInput}
        />
        <Text style={styles.smallNote}>{foods.length} meals loaded from nutrition database</Text>
      </GlassCard>

      {!!recentMeals.length && (
        <GlassCard>
          <Text style={styles.sectionTitle}>Recent</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
            {recentMeals.slice(0, 8).map((food) => (
              <Pressable
                key={`recent-${food.id}`}
                style={[styles.recentChip, selectedFood?.id === food.id ? styles.recentChipActive : null]}
                onPress={() => setSelectedId(food.id)}
              >
                <Text style={styles.recentText}>{iconByCategory[food.category] || '🍽️'} {food.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </GlassCard>
      )}

      <GlassCard>
        <Text style={styles.sectionTitle}>Meals</Text>
        <View style={styles.grid}>
          {filteredFoods.map((food) => (
            <BouncyCard
              key={food.id}
              icon={iconByCategory[food.category] || '🍽️'}
              label={food.name}
              caption={`${food.calories} kcal`}
              selected={selectedFood?.id === food.id}
              onPress={() => setSelectedId(food.id)}
              tone="#8EE3C0"
            />
          ))}
        </View>
        <Pressable style={styles.moreBtn} onPress={() => setShowAllMeals((v) => !v)}>
          <Text style={styles.moreBtnText}>{showAllMeals ? 'Show less' : 'Show more meals'}</Text>
        </Pressable>
      </GlassCard>

      {selectedFood ? (
        <GlassCard>
          <Text style={styles.sectionTitle}>{selectedFood.name}</Text>
          <Text style={styles.meta}>
            P {selectedFood.protein} • C {selectedFood.carbs} • F {selectedFood.fat} • Fiber {selectedFood.fiber}
          </Text>
          <View style={styles.portionWrap}>
            <Text style={styles.portionLabel}>Portion</Text>
            <View style={styles.portionRow}>
              <Pressable
                style={styles.portionBtn}
                onPress={() => setQuantity((q) => Number(Math.max(0.5, q - 0.5).toFixed(1)))}
              >
                <Text style={styles.portionBtnText}>−</Text>
              </Pressable>
              <View style={styles.portionValueWrap}>
                <Text style={styles.portionValue}>{quantity.toFixed(1)}x</Text>
              </View>
              <Pressable
                style={styles.portionBtn}
                onPress={() => setQuantity((q) => Number(Math.min(20, q + 0.5).toFixed(1)))}
              >
                <Text style={styles.portionBtnText}>+</Text>
              </Pressable>
            </View>
            <Text style={styles.portionHint}>Increases/decreases by 0.5 each tap</Text>
          </View>
        </GlassCard>
      ) : null}

      {daily ? (
        <GlassCard>
          <Text style={styles.sectionTitle}>Today Macro Tracker</Text>
          <View style={styles.macroRow}>
            <Text style={styles.macroName}>Protein</Text>
            <Text style={styles.macroValue}>
              {Math.round(daily.totals?.protein || 0)} / {Math.round(daily.goals?.protein || 0)} g
            </Text>
            <Text style={[styles.macroDelta, (daily.delta?.protein || 0) < 0 ? styles.macroOver : styles.macroRemain]}>
              {(daily.delta?.protein || 0) < 0 ? `${Math.abs(Math.round(daily.delta.protein))}g over` : `${Math.round(daily.delta?.protein || 0)}g left`}
            </Text>
          </View>
          <View style={styles.macroRow}>
            <Text style={styles.macroName}>Carbs</Text>
            <Text style={styles.macroValue}>
              {Math.round(daily.totals?.carbs || 0)} / {Math.round(daily.goals?.carbs || 0)} g
            </Text>
            <Text style={[styles.macroDelta, (daily.delta?.carbs || 0) < 0 ? styles.macroOver : styles.macroRemain]}>
              {(daily.delta?.carbs || 0) < 0 ? `${Math.abs(Math.round(daily.delta.carbs))}g over` : `${Math.round(daily.delta?.carbs || 0)}g left`}
            </Text>
          </View>
          <View style={styles.macroRow}>
            <Text style={styles.macroName}>Fat</Text>
            <Text style={styles.macroValue}>
              {Math.round(daily.totals?.fat || 0)} / {Math.round(daily.goals?.fat || 0)} g
            </Text>
            <Text style={[styles.macroDelta, (daily.delta?.fat || 0) < 0 ? styles.macroOver : styles.macroRemain]}>
              {(daily.delta?.fat || 0) < 0 ? `${Math.abs(Math.round(daily.delta.fat))}g over` : `${Math.round(daily.delta?.fat || 0)}g left`}
            </Text>
          </View>
          <View style={styles.macroRow}>
            <Text style={styles.macroName}>Calories</Text>
            <Text style={styles.macroValue}>
              {Math.round(daily.totals?.calories || 0)} / {Math.round(daily.goals?.calories || 0)} kcal
            </Text>
            <Text style={[styles.macroDelta, (daily.delta?.calories || 0) < 0 ? styles.macroOver : styles.macroRemain]}>
              {(daily.delta?.calories || 0) < 0 ? `${Math.abs(Math.round(daily.delta.calories))} over` : `${Math.round(daily.delta?.calories || 0)} left`}
            </Text>
          </View>
          <View style={styles.macroRow}>
            <Text style={styles.macroName}>Fiber</Text>
            <Text style={styles.macroValue}>
              {Math.round(daily.totals?.fiber || 0)} / {Math.round(daily.goals?.fiber || 0)} g
            </Text>
            <Text style={[styles.macroDelta, (daily.delta?.fiber || 0) < 0 ? styles.macroOver : styles.macroRemain]}>
              {(daily.delta?.fiber || 0) < 0 ? `${Math.abs(Math.round(daily.delta.fiber))}g over` : `${Math.round(daily.delta?.fiber || 0)}g left`}
            </Text>
          </View>
          <View style={styles.waterCard}>
            <Text style={styles.waterTitle}>Water Target</Text>
            <Text style={styles.waterValue}>{(daily.goals?.waterLiters || 0).toFixed(1)} L/day</Text>
          </View>
        </GlassCard>
      ) : null}

      <Pressable style={[styles.logButton, logging ? styles.logDisabled : null]} onPress={logMeal} disabled={logging}>
        {logging ? <ActivityIndicator color="#1C684F" /> : <Text style={styles.logText}>Log Meal + XP</Text>}
      </Pressable>
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
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFE8F7',
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: 'Nunito_700Bold',
    color: colors.text
  },
  smallNote: {
    marginTop: 8,
    fontFamily: 'Nunito_700Bold',
    color: colors.textSoft,
    fontSize: 12
  },
  recentRow: {
    gap: 8,
    paddingRight: 6
  },
  recentChip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DFE8F7',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  recentChipActive: {
    backgroundColor: '#D6F5E8',
    borderColor: '#8ED8BA'
  },
  recentText: {
    fontFamily: 'Nunito_700Bold',
    color: colors.text,
    fontSize: 12
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  meta: {
    fontFamily: 'Nunito_700Bold',
    color: colors.textSoft,
    fontSize: 13
  },
  logButton: {
    borderRadius: 16,
    backgroundColor: '#A9F1CF',
    borderWidth: 1,
    borderColor: '#72CEA5',
    alignItems: 'center',
    paddingVertical: 14
  },
  logDisabled: {
    opacity: 0.7
  },
  logText: {
    fontFamily: 'Poppins_700Bold',
    color: '#1C684F',
    fontSize: 15
  },
  moreBtn: {
    marginTop: 10,
    alignSelf: 'center',
    borderRadius: 999,
    backgroundColor: '#E8EFFD',
    borderWidth: 1,
    borderColor: '#CFDBF3',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  moreBtnText: {
    fontFamily: 'Nunito_700Bold',
    color: '#4A6388',
    fontSize: 12
  },
  portionWrap: {
    marginTop: 10
  },
  portionLabel: {
    fontFamily: 'Nunito_700Bold',
    color: colors.textSoft,
    fontSize: 12,
    marginBottom: 6
  },
  portionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  portionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4E2F8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  portionBtnText: {
    fontFamily: 'Poppins_700Bold',
    color: '#315B8A',
    fontSize: 20,
    lineHeight: 22
  },
  portionValueWrap: {
    minWidth: 86,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D9F7',
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  portionValue: {
    fontFamily: 'Poppins_700Bold',
    color: '#2F5F96',
    fontSize: 14
  },
  portionHint: {
    marginTop: 6,
    fontFamily: 'Nunito_700Bold',
    color: colors.textSoft,
    fontSize: 11
  },
  macroRow: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5ECFA',
    backgroundColor: '#FFFFFF',
    padding: 8,
    marginBottom: 7
  },
  macroName: {
    fontFamily: 'Poppins_700Bold',
    color: colors.text,
    fontSize: 12
  },
  macroValue: {
    marginTop: 2,
    fontFamily: 'Nunito_700Bold',
    color: colors.textSoft,
    fontSize: 12
  },
  macroDelta: {
    marginTop: 2,
    fontFamily: 'Nunito_700Bold',
    fontSize: 12
  },
  macroRemain: {
    color: '#2C7A5F'
  },
  macroOver: {
    color: '#AF4F5B'
  },
  waterCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCE6F9',
    backgroundColor: '#EEF5FF',
    padding: 9
  },
  waterTitle: {
    fontFamily: 'Poppins_700Bold',
    color: '#355D90',
    fontSize: 12
  },
  waterValue: {
    marginTop: 2,
    fontFamily: 'Nunito_700Bold',
    color: '#4A6F9D',
    fontSize: 12
  }
});
