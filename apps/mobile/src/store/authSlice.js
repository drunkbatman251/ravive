import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, setAuthToken } from '../api/client';

export const loginDemo = createAsyncThunk('auth/loginDemo', async () => {
  const response = await api.post('/auth/login', {
    email: 'demo@ravive.app',
    password: 'Demo@123'
  });
  return response.data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: '',
    user: null,
    status: 'idle',
    error: ''
  },
  reducers: {
    logout(state) {
      state.token = '';
      state.user = null;
      setAuthToken('');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginDemo.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginDemo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        setAuthToken(action.payload.token);
      })
      .addCase(loginDemo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Login failed';
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
