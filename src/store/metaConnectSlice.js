/**
 * metaConnectSlice.js
 *
 * Redux state for the Meta / WhatsApp Embedded Signup flow.
 *
 * Backend endpoints consumed:
 *   POST   /api/meta/embedded-signup/start/   → EmbeddedSignupView
 *   GET    /api/meta/waba/status/             → WABAStatusView
 *   DELETE /api/meta/waba/disconnect/         → WABADisconnectView
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getToken = (getState) => {
  const { auth } = getState();
  return auth.accessToken || localStorage.getItem("accessToken");
};

// ── Thunk: fetch WABA connection status for org ───────────────────────────────
export const fetchWABAStatus = createAsyncThunk(
  "metaConnect/fetchWABAStatus",
  async (_, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue("No auth token");

    try {
      const resp = await fetch(`${API_BASE_URL}/api/meta/waba/status/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to fetch WABA status");
      return data; // { status, waba_id, waba_name, phone_number, phone_number_id, connected_at }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Thunk: save Embedded Signup result to backend ─────────────────────────────
export const startEmbeddedSignup = createAsyncThunk(
  "metaConnect/startEmbeddedSignup",
  async ({ code, waba_id, phone_number_id, business_id = "" }, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue("No auth token");

    try {
      const resp = await fetch(`${API_BASE_URL}/api/meta/embedded-signup/start/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code, waba_id, phone_number_id, business_id }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to connect WhatsApp");
      return data; // { status, waba_id, waba_name, phone_number, phone_number_id }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Thunk: disconnect WABA ────────────────────────────────────────────────────
export const disconnectWABA = createAsyncThunk(
  "metaConnect/disconnectWABA",
  async (_, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue("No auth token");

    try {
      const resp = await fetch(`${API_BASE_URL}/api/meta/waba/disconnect/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to disconnect");
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const metaConnectSlice = createSlice({
  name: "metaConnect",
  initialState: {
    // WABA info fetched from backend
    wabaStatus: "idle",         // idle | not_connected | pending | connected | error | disconnected
    wabaId: null,
    wabaName: null,
    phoneNumber: null,
    phoneNumberId: null,
    connectedAt: null,

    // Popup / signup flow state
    signupStep: "idle",         // idle | sdk_loading | popup_open | saving | success | error

    // Loading flags
    isLoadingStatus: false,
    isSaving: false,
    isDisconnecting: false,

    error: null,
  },
  reducers: {
    setSignupStep(state, action) {
      state.signupStep = action.payload;
    },
    clearMetaError(state) {
      state.error = null;
    },
    resetSignupStep(state) {
      state.signupStep = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchWABAStatus
    builder
      .addCase(fetchWABAStatus.pending, (state) => {
        state.isLoadingStatus = true;
        state.error = null;
      })
      .addCase(fetchWABAStatus.fulfilled, (state, action) => {
        state.isLoadingStatus = false;
        const d = action.payload;
        state.wabaStatus   = d.status;
        state.wabaId       = d.waba_id       ?? null;
        state.wabaName     = d.waba_name     ?? null;
        state.phoneNumber  = d.phone_number  ?? null;
        state.phoneNumberId = d.phone_number_id ?? null;
        state.connectedAt  = d.connected_at  ?? null;
      })
      .addCase(fetchWABAStatus.rejected, (state, action) => {
        state.isLoadingStatus = false;
        state.error = action.payload;
      });

    // startEmbeddedSignup
    builder
      .addCase(startEmbeddedSignup.pending, (state) => {
        state.isSaving = true;
        state.signupStep = "saving";
        state.error = null;
      })
      .addCase(startEmbeddedSignup.fulfilled, (state, action) => {
        state.isSaving = false;
        state.signupStep = "success";
        const d = action.payload;
        state.wabaStatus    = "connected";
        state.wabaId        = d.waba_id        ?? null;
        state.wabaName      = d.waba_name      ?? null;
        state.phoneNumber   = d.phone_number   ?? null;
        state.phoneNumberId = d.phone_number_id ?? null;
      })
      .addCase(startEmbeddedSignup.rejected, (state, action) => {
        state.isSaving = false;
        state.signupStep = "error";
        state.error = action.payload;
      });

    // disconnectWABA
    builder
      .addCase(disconnectWABA.pending, (state) => {
        state.isDisconnecting = true;
        state.error = null;
      })
      .addCase(disconnectWABA.fulfilled, (state) => {
        state.isDisconnecting = false;
        state.wabaStatus    = "not_connected";
        state.wabaId        = null;
        state.wabaName      = null;
        state.phoneNumber   = null;
        state.phoneNumberId = null;
        state.connectedAt   = null;
        state.signupStep    = "idle";
      })
      .addCase(disconnectWABA.rejected, (state, action) => {
        state.isDisconnecting = false;
        state.error = action.payload;
      });
  },
});

export const { setSignupStep, clearMetaError, resetSignupStep } = metaConnectSlice.actions;
export default metaConnectSlice.reducer;