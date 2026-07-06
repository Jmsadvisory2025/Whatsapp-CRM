import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const BOT_API = import.meta.env.VITE_BOT_API_URL;

// ── Fetch customers (conversations for verified WABA number) ─────────────────
// const fetchCustomers = createAsyncThunk(
//   "whatsapp/fetchCustomers",
//   async (arg = null, { getState, rejectWithValue }) => {
//     const { auth } = getState();
//     const token = auth.accessToken || localStorage.getItem("accessToken");

//     if (!token) throw new Error("No authentication token available");

const fetchCustomers = createAsyncThunk(
  "whatsapp/fetchCustomers",
  async (arg = null, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.accessToken || localStorage.getItem("accessToken");
    if (!token) throw new Error("No authentication token available");


    try {
      let url =
        typeof arg === "string"
          ? arg
          : arg?.url || `${API_BASE_URL}/api/customer/`;

      // Build query params from filters object
      if (arg !== null && typeof arg === "object" && arg.filters && !arg.url) {
        const queryParams = new URLSearchParams();
        if (arg.filters.number) queryParams.append("number", arg.filters.number);
        if (arg.filters.from_date) queryParams.append("from_date", arg.filters.from_date);
        if (arg.filters.to_date) queryParams.append("to_date", arg.filters.to_date);
        if (arg.filters.status) queryParams.append("status", arg.filters.status);
        if (arg.page) queryParams.append("page", arg.page);
        if (arg.page_size) queryParams.append("page_size", arg.page_size);
        const qs = queryParams.toString();
        if (qs) url += `?${qs}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch customers");

      const reqPage = (arg && typeof arg === "object" && arg.page) ? arg.page : 1;
      return {
        results: data.results || [],
        count: data.count || 0,
        next: data.next || null,
        previous: data.previous || null,
        currentPageUrl: url,
        currentPage: data.page || reqPage,
        pageSize: data.page_size || 20, // using 20 as fallback to match backend
        wabaPhone: data.waba_phone || null,
      };


    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ── Send direct message ──────────────────────────────────────────────────────
// const sendDirectMessage = createAsyncThunk(
//   "whatsapp/sendDirectMessage",
//   async ({ conversation_id, message }, { getState, rejectWithValue }) => {
//     const { auth } = getState();
//     const token = auth.accessToken || localStorage.getItem("accessToken");
//     if (!token) throw new Error("No authentication token available");
// 
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/send-direct-message/`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ conversation_id, message }),
//       });
// 
//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message || "Failed to send message");
// 
//       return { ...data, conversation_id, sent_message: message };
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// ── Send bulk message ────────────────────────────────────────────────────────
const sendBulkMessage = createAsyncThunk(
  "whatsapp/sendBulkMessage",
  async ({ conversation_ids, message }, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.accessToken || localStorage.getItem("accessToken");
    if (!token) throw new Error("No authentication token available");

    try {
      const response = await fetch(`${API_BASE_URL}/api/send-bulk-message/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conversation_ids, message }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send bulk message");

      return { ...data, conversation_ids, sent_message: message };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ── Fetch messages for a conversation ───────────────────────────────────────
// const fetchConversationMessages = createAsyncThunk(
//   "whatsapp/fetchMessages",
//   async (conversationId, { getState, rejectWithValue }) => {
//     const { auth } = getState();
//     const token = auth.accessToken || localStorage.getItem("accessToken");
//     if (!token) throw new Error("No authentication token available");
const fetchConversationMessages = createAsyncThunk(
  "whatsapp/fetchMessages",
  async (conversationId, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.accessToken || localStorage.getItem("accessToken");
    if (!token) throw new Error("No authentication token available");

    try {
      const response = await fetch(
        `${API_BASE_URL}api/v1/conversations/${conversationId}/messages/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch messages");

      return { conversationId, messages: data.messages || [] };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ── Slice ────────────────────────────────────────────────────────────────────
const initialState = {
  customers: [],
  selectedCustomer: null,
  messages: [],
  wabaPhone: null,   // ← NEW: active verified number
  currentPage: 1,
  pagination: {
    count: 0,
    next: null,
    previous: null,
    currentPageUrl: null,
    currentPage: 1,
    totalPages: 1,
    pageSize: 100,
  },
  isLoading: false,
  isLoadingMessages: false,
  error: null,
  messagesError: null,
};

const whatsappSlice = createSlice({
  name: "whatsapp",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearMessagesError: (state) => { state.messagesError = null; },
    setSelectedCustomer: (state, action) => { state.selectedCustomer = action.payload; },
    clearMessages: (state) => { state.messages = []; },
  },
  extraReducers: (builder) => {
    builder
      // fetchCustomers
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = action.payload.results || [];
        state.wabaPhone = action.payload.wabaPhone;
        state.currentPage = action.payload.currentPage || 1;
        const total = action.payload.count || 0;
        const pageSize = action.payload.pageSize || 100;
        state.pagination = {
          count: total,
          next: action.payload.next,
          previous: action.payload.previous,
          currentPageUrl: action.payload.currentPageUrl,
          currentPage: action.payload.currentPage || 1,
          totalPages: Math.ceil(total / pageSize),
          pageSize,
        };
        state.error = null;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch customers";
      })

      // fetchConversationMessages
      .addCase(fetchConversationMessages.pending, (state) => {
        state.isLoadingMessages = true;
        state.messagesError = null;
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        state.isLoadingMessages = false;
        state.messages = action.payload.messages;
        state.messagesError = null;
      })
      .addCase(fetchConversationMessages.rejected, (state, action) => {
        state.isLoadingMessages = false;
        state.messagesError = action.payload || "Failed to fetch messages";
      })

      // sendDirectMessage — optimistically append to chat
      // .addCase(sendDirectMessage.fulfilled, (state, action) => {
      //   if (
      //     state.selectedCustomer &&
      //     state.selectedCustomer.conversation_id === action.payload.conversation_id
      //   ) {
      //     state.messages.push({
      //       id: `temp-${Date.now()}`,
      //       user_msg: null,
      //       user_timestamp: null,
      //       bot_msg: action.payload.sent_message,
      //       bot_timestamp: new Date().toISOString(),
      //     });
      //   }
      // });
  },
});

export const {
  clearError,
  clearMessagesError,
  setSelectedCustomer,
  clearMessages,
} = whatsappSlice.actions;

export {
  fetchCustomers,
  fetchConversationMessages,
  // sendDirectMessage,
  sendBulkMessage,
};

export default whatsappSlice.reducer;