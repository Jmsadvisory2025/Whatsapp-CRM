/**
 * campaignSlice.js
 *
 * Campaign Management — CSV Upload + Approved Template Broadcast via Meta API
 *
 * Backend endpoints consumed:
 *   GET  /api/templates/?status=APPROVED     → fetch only approved templates
 *   POST /api/campaigns/                     → create & launch campaign
 *   GET  /api/campaigns/                     → list past campaigns
 *   GET  /api/campaigns/<id>/                → get campaign detail / status
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getToken = (getState) => {
  const { auth } = getState();
  return auth.accessToken || localStorage.getItem("accessToken");
};

// ── Thunk: fetch APPROVED templates only ─────────────────────────────────────
export const fetchApprovedTemplates = createAsyncThunk(
  "campaign/fetchApprovedTemplates",
  async (_, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue("No auth token");

    try {
      const resp = await fetch(`${API_BASE_URL}/api/templates/?status=APPROVED`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to fetch templates");
      return data.results ?? [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Thunk: send campaign ──────────────────────────────────────────────────────
export const sendCampaign = createAsyncThunk(
  "campaign/send",
  async (payload, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue("No auth token");

    try {
      const resp = await fetch(`${API_BASE_URL}/api/campaigns/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || data.detail || "Failed to send campaign");
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Thunk: fetch past campaigns ───────────────────────────────────────────────
export const fetchCampaigns = createAsyncThunk(
  "campaign/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue("No auth token");

    try {
      const resp = await fetch(`${API_BASE_URL}/api/campaigns/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to fetch campaigns");
      return data.results ?? data ?? [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const campaignSlice = createSlice({
  name: "campaign",
  initialState: {
    approvedTemplates: [],
    campaigns: [],
    isFetchingTemplates: false,
    isSending: false,
    isFetchingCampaigns: false,
    sendSuccess: null,
    sendError: null,
    fetchError: null,
  },
  reducers: {
    clearSendResult(state) {
      state.sendSuccess = null;
      state.sendError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApprovedTemplates.pending, (state) => {
        state.isFetchingTemplates = true;
        state.fetchError = null;
      })
      .addCase(fetchApprovedTemplates.fulfilled, (state, action) => {
        state.isFetchingTemplates = false;
        state.approvedTemplates = action.payload;
      })
      .addCase(fetchApprovedTemplates.rejected, (state, action) => {
        state.isFetchingTemplates = false;
        state.fetchError = action.payload;
      });

    builder
      .addCase(sendCampaign.pending, (state) => {
        state.isSending = true;
        state.sendError = null;
        state.sendSuccess = null;
      })
      .addCase(sendCampaign.fulfilled, (state, action) => {
        state.isSending = false;
        state.sendSuccess = action.payload;
        if (action.payload?.id) {
          state.campaigns.unshift(action.payload);
        }
      })
      .addCase(sendCampaign.rejected, (state, action) => {
        state.isSending = false;
        state.sendError = action.payload;
      });

    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.isFetchingCampaigns = true;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.isFetchingCampaigns = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.isFetchingCampaigns = false;
        state.fetchError = action.payload;
      });
  },
});

export const { clearSendResult } = campaignSlice.actions;
export default campaignSlice.reducer;