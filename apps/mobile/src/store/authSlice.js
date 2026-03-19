import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import { api, setAuthToken } from '../api/client';

function readPersistedAuth() {
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') {
    return { token: '', user: null };
  }

  try {
    const token = localStorage.getItem('ravive_token') || '';
    const userJson = localStorage.getItem('ravive_user');
    const user = userJson ? JSON.parse(userJson) : null;
    if (token) setAuthToken(token);
    return { token, user };
  } catch {
    return { token: '', user: null };
  }
}

function persistAuth(token, user) {
  setAuthToken(token || '');
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') return;

  if (!token) {
    localStorage.removeItem('ravive_token');
    localStorage.removeItem('ravive_user');
    return;
  }

  localStorage.setItem('ravive_token', token);
  localStorage.setItem('ravive_user', JSON.stringify(user));
}

function formatAuthError(error, fallback) {
  if (error.code === 'ECONNABORTED') {
    return 'Server is waking up. Please wait a few seconds and try again.';
  }

  return error.response?.data?.message || error.message || fallback;
}

export const loginUser = createAsyncThunk('auth/loginUser', async ({ loginId, password }, thunkAPI) => {
  try {
    const response = await api.post('/auth/login', { loginId, password });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(formatAuthError(error, 'Login failed'));
  }
});

export const registerUser = createAsyncThunk('auth/registerUser', async ({ loginId, password }, thunkAPI) => {
  try {
    const response = await api.post('/auth/register', { loginId, password, name: loginId });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(formatAuthError(error, 'Registration failed'));
  }
});

export const loginDemo = createAsyncThunk('auth/loginDemo', async (_, thunkAPI) => {
  try {
    const response = await api.post('/auth/login', {
      loginId: 'demo@ravive.app',
      password: 'Demo@123'
    });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(formatAuthError(error, 'Demo login failed'));
  }
});

const persisted = readPersistedAuth();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: persisted.token,
    user: persisted.user,
    status: 'idle',
    error: ''
  },
  reducers: {
    logout(state) {
      state.token = '';
      state.user = null;
      persistAuth('', null);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        persistAuth(action.payload.token, action.payload.user);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Login failed';
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        persistAuth(action.payload.token, action.payload.user);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Registration failed';
      })
      .addCase(loginDemo.pending, (state) => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(loginDemo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        persistAuth(action.payload.token, action.payload.user);
      })
      .addCase(loginDemo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Login failed';
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
