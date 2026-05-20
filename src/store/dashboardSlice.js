import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

export const fetchDashboard = createAsyncThunk(
  "dashboard/fetch",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${API}/api/analytics/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to load dashboard"
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearDashboard: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null; // ← reset error on new fetch
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // ← now a string, not action.payload?.error
      });
  },
});

export const { clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;