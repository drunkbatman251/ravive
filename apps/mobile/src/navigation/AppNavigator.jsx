import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { DashboardScreen } from '../screens/DashboardScreen';
import { NutritionScreen } from '../screens/NutritionScreen';
import { ExerciseScreen } from '../screens/ExerciseScreen';
import { HabitScreen } from '../screens/HabitScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { SocialScreen } from '../screens/SocialScreen';
import { MentalHealthScreen } from '../screens/MentalHealthScreen';
import { ReadingScreen } from '../screens/ReadingScreen';
import { SleepScreen } from '../screens/SleepScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SatabdiProgramScreen } from '../screens/SatabdiProgramScreen';
import { RoutineModeScreen } from '../screens/RoutineModeScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F6FFF8',
    card: '#FFFFFF',
    text: '#243652',
    primary: '#47CDA2'
  }
};

function RootTabs() {
  const iconMap = {
    Dashboard: '🏠',
    Nutrition: '🍎',
    Exercise: '💪',
    Habit: '🔥',
    Analytics: '✨',
    Social: '⚔️'
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 76,
          paddingBottom: 10,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#E2EBFA',
          backgroundColor: '#FFFFFF'
        },
        tabBarLabelStyle: {
          fontFamily: 'Nunito_700Bold',
          fontSize: 11
        },
        tabBarActiveTintColor: '#35B78D',
        tabBarInactiveTintColor: '#8191AC',
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: focused ? 20 : 18 }}>{iconMap[route.name]}</Text>
        )
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} />
      <Tab.Screen name="Exercise" component={ExerciseScreen} />
      <Tab.Screen name="Habit" component={HabitScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Social" component={SocialScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const token = useSelector((s) => s.auth.token);

  return (
    <NavigationContainer theme={navTheme}>
      {!token ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={RootTabs} />
          <Stack.Screen name="MentalHealth" component={MentalHealthScreen} />
          <Stack.Screen name="Reading" component={ReadingScreen} />
          <Stack.Screen name="Sleep" component={SleepScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Achievements" component={AchievementsScreen} />
          <Stack.Screen name="SatabdiProgram" component={SatabdiProgramScreen} />
          <Stack.Screen name="RoutineMode" component={RoutineModeScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
