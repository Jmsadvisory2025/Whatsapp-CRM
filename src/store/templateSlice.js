/**
 * templateSlice.js
 *
 * Phase 4 — Template Management
 *
 * Backend endpoints consumed:
 *   GET    /api/templates/              → fetch all templates for the org
 *   POST   /api/templates/              → create template + submit to Meta
 *   PATCH  /api/templates/<id>/         → update CRM-side fields (body, header, etc.)
 *   DELETE /api/templates/<id>/         → delete from CRM + Meta
 *   POST   /api/templates/<id>/sync/    → sync one template status from Meta
 *   POST   /api/templates/sync-all/     → bulk sync all from Meta
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getToken = (getState) => {
  const { auth } = getState();
  return auth.accessToken || localStorage.getItem("accessToken");
};

// ── Thunk: fetch templates ────────────────────────────────────────────────────
export const fetchTemplates = createAsyncThunk(
  "templates/fetchAll",
  async (statusFilter = "", { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue("No auth token");
    try {
      const qs = statusFilter ? `?status=${statusFilter}` : "";
      const resp = await fetch(`${API_BASE_URL}/api/templates/${qs}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to fetch templates");
      return data; // { count, results }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Thunk: create template ────────────────────────────────────────────────────
export const createTemplate = createAsyncThunk(
  "templates/create",
  async (payload, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue("No auth token");
    try {
      const isFormData = payload instanceof FormData;
      
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      
      if (!isFormData) {
        headers["Content-Type"] = "application/json";
      }

      const resp = await fetch(`${API_BASE_URL}/api/templates/`, {
        method: "POST",
        headers,
        body: isFormData ? payload : JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok && resp.status !== 202)
        throw new Error(data.error || "Failed to create template");
      return { ...data, _httpStatus: resp.status };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Thunk: update template (PATCH — CRM fields only) ─────────────────────────
export const updateTemplate = createAsyncThunk(
  "templates/update",
  async ({ id, payload }, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue("No auth token");
    try {
      const resp = await fetch(`${API_BASE_URL}/api/templates/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to update template");
      return data; // returns full updated template object
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Thunk: delete template ────────────────────────────────────────────────────
export const deleteTemplate = createAsyncThunk(
  "templates/delete",
  async (id, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue("No auth token");
    try {
      const resp = await fetch(`${API_BASE_URL}/api/templates/${id}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to delete template");
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Thunk: sync one template ──────────────────────────────────────────────────
export const syncTemplate = createAsyncThunk(
  "templates/syncOne",
  async (id, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue("No auth token");
    try {
      const resp = await fetch(`${API_BASE_URL}/api/templates/${id}/sync/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Sync failed");
      return data; // { id, status, synced }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Thunk: sync all templates ─────────────────────────────────────────────────
export const syncAllTemplates = createAsyncThunk(
  "templates/syncAll",
  async (_, { getState, rejectWithValue, dispatch }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue("No auth token");
    try {
      const resp = await fetch(`${API_BASE_URL}/api/templates/sync-all/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Sync-all failed");
      dispatch(fetchTemplates());
      return data; // { synced_from_meta, updated_locally, created_locally }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const templateSlice = createSlice({
  name: "templates",
  initialState: {
    list:            [],
    count:           0,
    isLoading:       false,
    isCreating:      false,
    isUpdatingId:    null,   // id of the template being updated
    isDeletingId:    null,
    isSyncingId:     null,
    isSyncingAll:    false,
    createSuccess:   false,
    updateSuccess:   false,
    syncAllResult:   null,
    error:           null,
    createError:     null,
    updateError:     null,
  },
  reducers: {
    clearError(state) {
      state.error = null;
      state.createError = null;
      state.updateError = null;
    },
    clearCreateSuccess(state) {
      state.createSuccess = false;
      state.createError = null;
    },
    clearUpdateSuccess(state) {
      state.updateSuccess = false;
      state.updateError = null;
    },
    clearSyncAllResult(state) {
      state.syncAllResult = null;
    },
  },
  extraReducers: (builder) => {

    // fetchTemplates
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list  = action.payload.results ?? [];
        state.count = action.payload.count   ?? 0;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // createTemplate
    builder
      .addCase(createTemplate.pending, (state) => {
        state.isCreating    = true;
        state.createError   = null;
        state.createSuccess = false;
      })
      .addCase(createTemplate.fulfilled, (state) => {
        state.isCreating    = false;
        state.createSuccess = true;
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.isCreating  = false;
        state.createError = action.payload;
      });

    // updateTemplate
    builder
      .addCase(updateTemplate.pending, (state, action) => {
        state.isUpdatingId = action.meta.arg.id;
        state.updateError  = null;
        state.updateSuccess = false;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.isUpdatingId  = null;
        state.updateSuccess = true;
        // Patch the updated template into the list
        const idx = state.list.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload };
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.isUpdatingId = null;
        state.updateError  = action.payload;
      });

    // deleteTemplate
    builder
      .addCase(deleteTemplate.pending, (state, action) => {
        state.isDeletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.isDeletingId = null;
        state.list  = state.list.filter((t) => t.id !== action.payload);
        state.count = Math.max(0, state.count - 1);
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.isDeletingId = null;
        state.error = action.payload;
      });

    // syncTemplate (one)
    builder
      .addCase(syncTemplate.pending, (state, action) => {
        state.isSyncingId = action.meta.arg;
        state.error = null;
      })
      .addCase(syncTemplate.fulfilled, (state, action) => {
        state.isSyncingId = null;
        const { id, status: newStatus } = action.payload;
        const t = state.list.find((t) => t.id === id);
        if (t) t.status = newStatus;
      })
      .addCase(syncTemplate.rejected, (state, action) => {
        state.isSyncingId = null;
        state.error = action.payload;
      });

    // syncAllTemplates
    builder
      .addCase(syncAllTemplates.pending, (state) => {
        state.isSyncingAll  = true;
        state.syncAllResult = null;
        state.error = null;
      })
      .addCase(syncAllTemplates.fulfilled, (state, action) => {
        state.isSyncingAll  = false;
        state.syncAllResult = action.payload;
      })
      .addCase(syncAllTemplates.rejected, (state, action) => {
        state.isSyncingAll = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCreateSuccess,
  clearUpdateSuccess,
  clearSyncAllResult,
} = templateSlice.actions;

export default templateSlice.reducer;