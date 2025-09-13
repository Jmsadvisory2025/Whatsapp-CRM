import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = 'https://mcrm-cbe4exh8ghdheben.centralindia-01.azurewebsites.net';

// Async thunk to fetch dashboard analytics
export const fetchDashboardAnalytics = createAsyncThunk(
  'dashboard/fetchAnalytics',
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.accessToken || localStorage.getItem('accessToken');

    if (!token) {
      throw new Error('No authentication token available');
    }

    try {
      const response = await fetch(`${BASE_URL}/api/v1/analytics/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log('Analytics Response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch analytics');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch recent activity
export const fetchRecentActivity = createAsyncThunk(
  'dashboard/fetchRecentActivity',
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.accessToken || localStorage.getItem('accessToken');

    if (!token) {
      throw new Error('No authentication token available');
    }

    try {
      const response = await fetch(`${BASE_URL}/api/v1/dashboard/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log('Recent Activity Response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch recent activity');
      }

      // Return the array directly if the response is an array, or extract recent_activity if it's an object
      return Array.isArray(data) ? data : data.recent_activity || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  totals: {
    total_inquiries: 0,
    prospects: 0,
    leads: 0,
    patients: 0,
  },
  daily_trend: [],
  monthly_trend: [],
  recent_activity: [],
  isLoading: false,
  error: null,
  offset: 0,
  limit: 10,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
    loadMoreActivity: (state) => {
      state.offset += state.limit;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.totals = action.payload.totals || initialState.totals;
        state.daily_trend = action.payload.daily_trend || [];
        state.monthly_trend = action.payload.monthly_trend || [];
        state.error = null;
      })
      .addCase(fetchDashboardAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchRecentActivity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecentActivity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recent_activity = action.payload;
        state.error = null;
      })
      .addCase(fetchRecentActivity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDashboardError, loadMoreActivity } = dashboardSlice.actions;
export default dashboardSlice.reducer;