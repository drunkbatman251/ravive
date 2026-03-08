import 'react-native-gesture-handler';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Nunito_600SemiBold,
  Nunito_700Bold
} from '@expo-google-fonts/nunito';
import {
  Poppins_600SemiBold,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';
import { AppNavigator } from './src/navigation/AppNavigator';
import { store } from './src/store';
import { MascotOverlay } from './src/components/MascotOverlay';

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_600SemiBold,
    Nunito_700Bold,
    Poppins_600SemiBold,
    Poppins_700Bold
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FFF9' }}>
        <ActivityIndicator size="large" color="#4AC7A3" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <StatusBar style="dark" />
      <AppNavigator />
      <MascotOverlay />
    </Provider>
  );
}
