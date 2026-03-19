import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

function resolveApiUrl() {
  const configured = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

  if (Platform.OS === 'web') return configured;

  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  const deviceHost = hostUri?.split(':')[0];

  if (configured.includes('localhost') && deviceHost) {
    return configured.replace('localhost', deviceHost);
  }

  return configured;
}

const baseURL = resolveApiUrl();

export const api = axios.create({
  baseURL,
  timeout: 25000
});

let authToken = '';

export function setAuthToken(token) {
  authToken = token;
}

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});
