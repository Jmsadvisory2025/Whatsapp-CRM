// src/store/techProviderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API     = import.meta.env.VITE_API_BASE_URL;   // auth/templates
// const BOT_API = import.meta.env.VITE_BOT_API_URL;    // industry/* routes
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

// ── Dashboard summary ────────────────────────────────────────────────────────
export const fetchTpDashboard = createAsyncThunk(
  "techProvider/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API}api/industry/dashboard/`, {
        headers: authHeaders(),
      });
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.error || "Failed");
    }
  }
);

// ── Conversations (Whatsapp inbox) ───────────────────────────────────────────
export const fetchTpConversations = createAsyncThunk(
  "techProvider/fetchConversations",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API}api/industry/conversations/`, {
        headers: authHeaders(),
        params,
      });
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.error || "Failed");
    }
  }
);

// ── Single conversation messages ─────────────────────────────────────────────
export const fetchTpConversationMessages = createAsyncThunk(
  "techProvider/fetchMessages",
  async (conversationId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API}api/industry/conversations/${conversationId}/messages/`,
        { headers: authHeaders() }
      );
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.error || "Failed");
    }
  }
);

// ── Leads & Prospects (customers) ────────────────────────────────────────────
export const fetchTpCustomers = createAsyncThunk(
  "techProvider/fetchCustomers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API}api/industry/customers/`, {
        headers: authHeaders(),
        params,
      });
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.error || "Failed");
    }
  }
);

// ── Analytics messages ───────────────────────────────────────────────────────
export const fetchTpAnalytics = createAsyncThunk(
  "techProvider/fetchAnalytics",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API}api/industry/analytics/messages/`, {
        headers: authHeaders(),
        params,
      });
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.error || "Failed");
    }
  }
);

// ── Slice ────────────────────────────────────────────────────────────────────
const techProviderSlice = createSlice({
  name: "techProvider",
  initialState: {
    // dashboard
    dashboard: null,
    dashboardLoading: false,
    // conversations (whatsapp inbox)
    conversations: [],
    conversationsCount: 0,
    conversationsLoading: false,
    // messages
    messages: [],
    messagesLoading: false,
    selectedConversation: null,
    // customers (leads)
    customers: [],
    customersCount: 0,
    customersLoading: false,
    // analytics
    analytics: null,
    analyticsLoading: false,

    error: null,
  },
  reducers: {
    setTpSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },
    clearTpError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // dashboard
      .addCase(fetchTpDashboard.pending,   (s) => { s.dashboardLoading = true; })
      .addCase(fetchTpDashboard.fulfilled, (s, a) => { s.dashboardLoading = false; s.dashboard = a.payload; })
      .addCase(fetchTpDashboard.rejected,  (s, a) => { s.dashboardLoading = false; s.error = a.payload; })
      // conversations
      .addCase(fetchTpConversations.pending,   (s) => { s.conversationsLoading = true; })
      .addCase(fetchTpConversations.fulfilled, (s, a) => {
        s.conversationsLoading = false;
        s.conversations      = a.payload.results;
        s.conversationsCount = a.payload.count;
      })
      .addCase(fetchTpConversations.rejected,  (s, a) => { s.conversationsLoading = false; s.error = a.payload; })
      // messages
      .addCase(fetchTpConversationMessages.pending,   (s) => { s.messagesLoading = true; })
      .addCase(fetchTpConversationMessages.fulfilled, (s, a) => {
        s.messagesLoading = false;
        s.messages = a.payload.messages;
        s.selectedConversation = {
          customer_name:  a.payload.customer_name,
          customer_phone: a.payload.customer_phone,
          status:         a.payload.status,
        };
      })
      .addCase(fetchTpConversationMessages.rejected,  (s, a) => { s.messagesLoading = false; s.error = a.payload; })
      // customers
      .addCase(fetchTpCustomers.pending,   (s) => { s.customersLoading = true; })
      .addCase(fetchTpCustomers.fulfilled, (s, a) => {
        s.customersLoading = false;
        s.customers      = a.payload.results;
        s.customersCount = a.payload.count;
      })
      .addCase(fetchTpCustomers.rejected,  (s, a) => { s.customersLoading = false; s.error = a.payload; })
      // analytics
      .addCase(fetchTpAnalytics.pending,   (s) => { s.analyticsLoading = true; })
      .addCase(fetchTpAnalytics.fulfilled, (s, a) => { s.analyticsLoading = false; s.analytics = a.payload; })
      .addCase(fetchTpAnalytics.rejected,  (s, a) => { s.analyticsLoading = false; s.error = a.payload; });
  },
});

export const { setTpSelectedConversation, clearTpError } = techProviderSlice.actions;
export default techProviderSlice.reducer;