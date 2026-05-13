import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Async thunk to fetch prospects with pagination
export const fetchProspects = createAsyncThunk(
  "prospects/fetch",
  async (pageUrl = null, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.accessToken || localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("No authentication token available");
    }

    try {
      // Use provided page URL or default to first page
      const url = pageUrl || `${API_BASE_URL}/api/v1/leads/prospects/`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(
          data.message || "Sorry, you are not part of the organization"
        );
      }

      return {
        results: data.results || [],
        count: data.count || 0,
        next: data.next,
        previous: data.previous,
        currentPageUrl: url
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to search prospects
export const searchProspects = createAsyncThunk(
  "prospects/search",
  async (query, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.accessToken || localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("No authentication token available");
    }

    try {
      const url = `${API_BASE_URL}/api/v1/conversations/search/?q=${encodeURIComponent(query)}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(
          data.message || "Failed to search prospects"
        );
      }

      // Transform the search response to match the pagination structure
      // Normalize the data structure to match regular prospects
      const normalizedData = Array.isArray(data) ? data.map(item => ({
        ...item,
        // Ensure assigned_to is consistent (string format)
        assigned_to: typeof item.assigned_to === 'object' && item.assigned_to !== null 
          ? item.assigned_to.name 
          : item.assigned_to,
        // Ensure patient_name is populated (fallback to customer_name if needed)
        patient_name: item.patient_name || item.customer_name || "",
      })) : [];

      return {
        results: normalizedData || [],
        count: normalizedData.length || 0,
        next: null,
        previous: null,
        currentPageUrl: url
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to convert prospect to lead
export const convertProspectToLead = createAsyncThunk(
  "prospects/convert",
  async (
    { conversation_id, phone, patient_name, disease },
    { getState, rejectWithValue }
  ) => {
    const { auth } = getState();
    const token = auth.accessToken || localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("No authentication token available");
    }

    // Validate required fields
    if (!conversation_id || !phone || !patient_name || !disease) {
      throw new Error("Conversation ID, Phone, Name, and Disease are required");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/leads/convert/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conversation_id, phone, patient_name, disease }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to convert prospect to lead");
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to update prospect
export const updateProspect = createAsyncThunk(
  "prospects/update",
  async (
    { conversation_id, patient_name, disease, notes },
    { getState, rejectWithValue }
  ) => {
    const { auth } = getState();
    const token = auth.accessToken || localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("No authentication token available");
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/conversations/${conversation_id}/update/`,
        {
          method: "POST", // Adjust to PUT if required by API
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ patient_name, disease, notes }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update prospect");
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  prospects: [],
  pagination: {
    count: 0,
    next: null,
    previous: null,
    currentPageUrl: null
  },
  isLoading: false,
  error: null,
  isSearching: false,
  searchResults: [],
};

const prospectsSlice = createSlice({
  name: "prospects",
  initialState,
  reducers: {
    clearProspectsError: (state) => {
      state.error = null;
    },
    setProspectsError: (state, action) => {
      state.error = action.payload;
    },
    resetAction: (state) => {
      state.selectedProspect = null;
      state.selectedAction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProspects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProspects.fulfilled, (state, action) => {
        state.isLoading = false;
        // Store pagination data
        state.pagination = {
          count: action.payload.count || 0,
          next: action.payload.next,
          previous: action.payload.previous,
          currentPageUrl: action.payload.currentPageUrl
        };
        // Store results
        state.prospects = action.payload.results || [];
        state.error = null;
      })
      .addCase(fetchProspects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(searchProspects.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchProspects.fulfilled, (state, action) => {
        state.isSearching = false;
        // Store pagination data
        state.pagination = {
          count: action.payload.count || 0,
          next: action.payload.next,
          previous: action.payload.previous,
          currentPageUrl: action.payload.currentPageUrl
        };
        // Store search results
        state.prospects = action.payload.results || [];
        state.error = null;
      })
      .addCase(searchProspects.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload;
      })
      .addCase(convertProspectToLead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(convertProspectToLead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.prospects = state.prospects.filter(
          (p) => p.conversation_id !== action.meta.arg.conversation_id
        ); // Remove converted prospect
        state.error = null;
      })
      .addCase(convertProspectToLead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateProspect.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProspect.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the prospect with new data if returned by API
        const updatedProspect = action.payload;
        state.prospects = state.prospects.map((p) =>
          p.conversation_id === updatedProspect.conversation_id
            ? { ...p, ...updatedProspect }
            : p
        );
        state.error = null;
      })
      .addCase(updateProspect.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProspectsError, setProspectsError, resetAction } =
  prospectsSlice.actions;
export default prospectsSlice.reducer;
