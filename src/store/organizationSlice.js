import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = 'https://mcrm-cbe4exh8ghdheben.centralindia-01.azurewebsites.net';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

// Async thunk for creating organization
export const createOrganization = createAsyncThunk(
  'organization/create',
  async (organizationData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      const response = await fetch(`${BASE_URL}/api/organization/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(organizationData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle validation errors from API
        if (data.name || data.email || data.website) {
          const errors = {};
          if (data.name) errors.name = data.name[0];
          if (data.email) errors.email = data.email[0];
          if (data.website) errors.website = data.website[0];
          return rejectWithValue({ fieldErrors: errors });
        }
        throw new Error(data.message || 'Failed to create organization');
      }
      
      return data;
    } catch (error) {
      return rejectWithValue({ 
        message: error.message || 'Network error occurred' 
      });
    }
  }
);

const initialState = {
  organization: null,
  isLoading: false,
  error: null,
  fieldErrors: {},
  isCreated: false,
};

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.fieldErrors = {};
    },
    clearFieldError: (state, action) => {
      delete state.fieldErrors[action.payload];
    },
    resetOrganizationState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrganization.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.fieldErrors = {};
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.isLoading = false;
        state.organization = action.payload;
        state.isCreated = true;
        state.error = null;
        state.fieldErrors = {};
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.isLoading = false;
        state.isCreated = false;
        
        if (action.payload?.fieldErrors) {
          state.fieldErrors = action.payload.fieldErrors;
          state.error = null;
        } else {
          state.error = action.payload?.message || 'Failed to create organization';
          state.fieldErrors = {};
        }
      });
  },
});

export const { 
  clearErrors, 
  clearFieldError, 
  resetOrganizationState 
} = organizationSlice.actions;

export default organizationSlice.reducer;