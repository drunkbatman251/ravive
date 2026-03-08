import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api/client';

export const fetchDashboard = createAsyncThunk('app/fetchDashboard', async () => {
  const response = await api.get('/dashboard');
  return response.data;
});

export const fetchAnalytics = createAsyncThunk('app/fetchAnalytics', async () => {
  const response = await api.get('/analytics');
  return response.data;
}, {
  condition: (_, { getState }) => {
    const { app } = getState();
    return !app.analytics;
  }
});

export const fetchFoodItems = createAsyncThunk('app/fetchFoods', async () => {
  const response = await api.get('/nutrition/foods');
  return response.data;
}, {
  condition: (_, { getState }) => {
    const { app } = getState();
    return !app.foods.length;
  }
});

export const fetchRecentMeals = createAsyncThunk('app/fetchRecentMeals', async () => {
  const response = await api.get('/nutrition/recent');
  return response.data;
});

export const fetchExercises = createAsyncThunk('app/fetchExercises', async () => {
  const response = await api.get('/exercises');
  return response.data;
}, {
  condition: (_, { getState }) => {
    const { app } = getState();
    return !app.exercises.length;
  }
});

export const fetchAchievements = createAsyncThunk('app/fetchAchievements', async () => {
  const response = await api.get('/achievements');
  return response.data;
});

export const fetchAiCoach = createAsyncThunk('app/fetchAiCoach', async () => {
  const response = await api.get('/ai/coach');
  return response.data;
});

export const fetchSocialOverview = createAsyncThunk('app/fetchSocialOverview', async () => {
  const response = await api.get('/social/overview');
  return response.data;
});

export const fetchDailyMiniChallenge = createAsyncThunk('app/fetchDailyMiniChallenge', async () => {
  const response = await api.get('/challenges/daily');
  return response.data;
});

export const completeDailyMiniChallenge = createAsyncThunk('app/completeDailyMiniChallenge', async (challengeId) => {
  const response = await api.post('/challenges/daily/complete', { challengeId });
  return response.data;
});

export const fetchSatabdiProgram = createAsyncThunk('app/fetchSatabdiProgram', async () => {
  const response = await api.get('/programs/satabdi');
  return response.data;
});

export const sendFriendRequest = createAsyncThunk('app/sendFriendRequest', async (friendCode) => {
  const response = await api.post('/social/friend-request', { friendCode });
  return response.data;
});

export const respondFriendRequest = createAsyncThunk('app/respondFriendRequest', async ({ requestId, action }) => {
  const response = await api.post('/social/friend-request/respond', { requestId, action });
  return response.data;
});

export const createSocialChallenge = createAsyncThunk('app/createChallenge', async (payload) => {
  const response = await api.post('/social/challenges', payload);
  return response.data;
});

export const joinSocialChallenge = createAsyncThunk('app/joinChallenge', async (challengeId) => {
  const response = await api.post(`/social/challenges/${challengeId}/join`);
  return response.data;
});

const appSlice = createSlice({
  name: 'app',
  initialState: {
    dashboard: null,
    analytics: null,
    foods: [],
    recentMeals: [],
    exercises: [],
    achievements: [],
    aiCoach: '',
    notifications: [
      'You are 20g short of protein today.',
      "You have not moved for 4 hours. Take a 10 minute walk for +20 XP."
    ],
    mascotEvent: null,
    soundEnabled: true,
    social: {
      me: null,
      incomingRequests: [],
      friends: [],
      leaderboard: [],
      challenges: []
    },
    miniChallenge: null,
    satabdiProgram: null,
    status: 'idle'
  },
  reducers: {
    pushNotification(state, action) {
      state.notifications.unshift(action.payload);
      state.notifications = state.notifications.slice(0, 8);
    },
    showMascotEvent(state, action) {
      state.mascotEvent = { id: Date.now(), ...action.payload };
    },
    clearMascotEvent(state) {
      state.mascotEvent = null;
    },
    toggleSound(state) {
      state.soundEnabled = !state.soundEnabled;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })
      .addCase(fetchFoodItems.fulfilled, (state, action) => {
        state.foods = action.payload;
      })
      .addCase(fetchRecentMeals.fulfilled, (state, action) => {
        state.recentMeals = action.payload;
      })
      .addCase(fetchExercises.fulfilled, (state, action) => {
        state.exercises = action.payload;
      })
      .addCase(fetchAchievements.fulfilled, (state, action) => {
        state.achievements = action.payload.achievements || [];
      })
      .addCase(fetchAiCoach.fulfilled, (state, action) => {
        state.aiCoach = action.payload.advice;
      })
      .addCase(fetchSocialOverview.fulfilled, (state, action) => {
        state.social = action.payload;
      })
      .addCase(fetchDailyMiniChallenge.fulfilled, (state, action) => {
        state.miniChallenge = action.payload;
      })
      .addCase(completeDailyMiniChallenge.fulfilled, (state, action) => {
        if (state.miniChallenge) {
          state.miniChallenge.completed = true;
          state.miniChallenge.xp_awarded = action.payload?.challenge?.xpReward || 0;
        }
      })
      .addCase(fetchSatabdiProgram.fulfilled, (state, action) => {
        state.satabdiProgram = action.payload;
      });
  }
});

export const { pushNotification, showMascotEvent, clearMascotEvent, toggleSound } = appSlice.actions;
export default appSlice.reducer;
