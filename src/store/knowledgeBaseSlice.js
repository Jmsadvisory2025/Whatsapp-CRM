/**
 * knowledgeBaseSlice.js
 *
 * Phase 4 Chatbot — Knowledge Base + Chatbot Config state
 *
 * Backend endpoints consumed:
 *   GET    /api/chatbot/config/        → fetchChatbotConfig
 *   POST   /api/chatbot/config/        → saveChatbotConfig
 *   GET    /api/chatbot/kb/            → fetchKBDocuments
 *   POST   /api/chatbot/kb/            → uploadKBDocument  (multipart or JSON)
 *   DELETE /api/chatbot/kb/<id>/       → deleteKBDocument
 *   PATCH  /api/chatbot/kb/<id>/       → toggleKBDocument
 *   GET    /api/chatbot/stats/         → fetchChatbotStats
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getToken = (getState) => {
  const { auth } = getState();
  return auth.accessToken || localStorage.getItem("accessToken");
};

// ── Thunk: fetch config ───────────────────────────────────────────────────────
export const fetchChatbotConfig = createAsyncThunk(
  "knowledgeBase/fetchConfig",
  async (_, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue("No auth token");
    try {
      const resp = await fetch(`${API_BASE_URL}/api/chatbot/config/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to load config");
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Thunk: save config ────────────────────────────────────────────────────────
export const saveChatbotConfig = createAsyncThunk(
  "knowledgeBase/saveConfig",
  async (payload, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue("No auth token");
    try {
      const resp = await fetch(`${API_BASE_URL}/api/chatbot/config/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to save config");
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Thunk: fetch KB documents ─────────────────────────────────────────────────
export const fetchKBDocuments = createAsyncThunk(
  "knowledgeBase/fetchDocs",
  async (_, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue("No auth token");
    try {
      const resp = await fetch(`${API_BASE_URL}/api/chatbot/kb/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to load documents");
      return data; // { count, results }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Thunk: upload KB document ─────────────────────────────────────────────────
export const uploadKBDocument = createAsyncThunk(
  "knowledgeBase/upload",
  async ({ title, content, file }, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue("No auth token");
    try {
      let body;
      let headers = { Authorization: `Bearer ${token}` };

      if (file) {
        // multipart upload
        const fd = new FormData();
        fd.append("title", title);
        fd.append("file", file);
        body = fd;
        // Don't set Content-Type — browser sets it with boundary
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({ title, content });
      }

      const resp = await fetch(`${API_BASE_URL}/api/chatbot/kb/`, {
        method: "POST",
        headers,
        body,
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Upload failed");
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Thunk: delete KB document ─────────────────────────────────────────────────
export const deleteKBDocument = createAsyncThunk(
  "knowledgeBase/delete",
  async (id, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue("No auth token");
    try {
      const resp = await fetch(`${API_BASE_URL}/api/chatbot/kb/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Delete failed");
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Thunk: toggle KB document active/inactive ─────────────────────────────────
export const toggleKBDocument = createAsyncThunk(
  "knowledgeBase/toggle",
  async ({ id, is_active }, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue("No auth token");
    try {
      const resp = await fetch(`${API_BASE_URL}/api/chatbot/kb/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Toggle failed");
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Thunk: chatbot stats ──────────────────────────────────────────────────────
export const fetchChatbotStats = createAsyncThunk(
  "knowledgeBase/fetchStats",
  async (_, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue("No auth token");
    try {
      const resp = await fetch(`${API_BASE_URL}/api/chatbot/stats/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to load stats");
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const knowledgeBaseSlice = createSlice({
  name: "knowledgeBase",
  initialState: {
    // config
    config:          null,
    isLoadingConfig: false,
    isSavingConfig:  false,
    configError:     null,
    configSaved:     false,

    // KB documents
    documents:       [],
    docCount:        0,
    isLoadingDocs:   false,
    isUploading:     false,
    isDeletingId:    null,
    isTogglingId:    null,
    uploadError:     null,
    uploadSuccess:   false,
    docsError:       null,

    // stats
    stats:           null,
    isLoadingStats:  false,
  },
  reducers: {
    clearUploadSuccess(state) {
      state.uploadSuccess = false;
      state.uploadError   = null;
    },
    clearConfigSaved(state) {
      state.configSaved  = false;
      state.configError  = null;
    },
    clearErrors(state) {
      state.configError = null;
      state.uploadError = null;
      state.docsError   = null;
    },
  },
  extraReducers: (builder) => {

    // fetchChatbotConfig
    builder
      .addCase(fetchChatbotConfig.pending, (s) => { s.isLoadingConfig = true; s.configError = null; })
      .addCase(fetchChatbotConfig.fulfilled, (s, a) => { s.isLoadingConfig = false; s.config = a.payload; })
      .addCase(fetchChatbotConfig.rejected, (s, a) => { s.isLoadingConfig = false; s.configError = a.payload; });

    // saveChatbotConfig
    builder
      .addCase(saveChatbotConfig.pending, (s) => { s.isSavingConfig = true; s.configError = null; s.configSaved = false; })
      .addCase(saveChatbotConfig.fulfilled, (s, a) => { s.isSavingConfig = false; s.config = a.payload; s.configSaved = true; })
      .addCase(saveChatbotConfig.rejected, (s, a) => { s.isSavingConfig = false; s.configError = a.payload; });

    // fetchKBDocuments
    builder
      .addCase(fetchKBDocuments.pending, (s) => { s.isLoadingDocs = true; s.docsError = null; })
      .addCase(fetchKBDocuments.fulfilled, (s, a) => { s.isLoadingDocs = false; s.documents = a.payload.results ?? []; s.docCount = a.payload.count ?? 0; })
      .addCase(fetchKBDocuments.rejected, (s, a) => { s.isLoadingDocs = false; s.docsError = a.payload; });

    // uploadKBDocument
    builder
      .addCase(uploadKBDocument.pending, (s) => { s.isUploading = true; s.uploadError = null; s.uploadSuccess = false; })
      .addCase(uploadKBDocument.fulfilled, (s, a) => {
        s.isUploading  = false;
        s.uploadSuccess = true;
        s.documents    = [a.payload, ...s.documents];
        s.docCount     += 1;
      })
      .addCase(uploadKBDocument.rejected, (s, a) => { s.isUploading = false; s.uploadError = a.payload; });

    // deleteKBDocument
    builder
      .addCase(deleteKBDocument.pending, (s, a) => { s.isDeletingId = a.meta.arg; })
      .addCase(deleteKBDocument.fulfilled, (s, a) => {
        s.isDeletingId = null;
        s.documents    = s.documents.filter((d) => d.id !== a.payload);
        s.docCount     = Math.max(0, s.docCount - 1);
      })
      .addCase(deleteKBDocument.rejected, (s, a) => { s.isDeletingId = null; s.docsError = a.payload; });

    // toggleKBDocument
    builder
      .addCase(toggleKBDocument.pending, (s, a) => { s.isTogglingId = a.meta.arg.id; })
      .addCase(toggleKBDocument.fulfilled, (s, a) => {
        s.isTogglingId = null;
        const idx = s.documents.findIndex((d) => d.id === a.payload.id);
        if (idx !== -1) s.documents[idx] = a.payload;
      })
      .addCase(toggleKBDocument.rejected, (s, a) => { s.isTogglingId = null; s.docsError = a.payload; });

    // fetchChatbotStats
    builder
      .addCase(fetchChatbotStats.pending, (s) => { s.isLoadingStats = true; })
      .addCase(fetchChatbotStats.fulfilled, (s, a) => { s.isLoadingStats = false; s.stats = a.payload; })
      .addCase(fetchChatbotStats.rejected, (s) => { s.isLoadingStats = false; });
  },
});

export const { clearUploadSuccess, clearConfigSaved, clearErrors } = knowledgeBaseSlice.actions;
export default knowledgeBaseSlice.reducer;