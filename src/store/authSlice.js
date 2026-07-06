// store/authSlice.js
// ==================
// Updated to store full org profile fields returned by the new UserMeView.
// Changes vs original:
//   - saveAuthToStorage: also saves org_email, org_website, owner_name, owner_email
//   - initialState: hydrates those 4 fields from localStorage
//   - fetchMe.fulfilled + verifyOtp.fulfilled: store them in state

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─── helpers ────────────────────────────────────────────────────────────────
const saveAuthToStorage = ({
  access, refresh, role, organization, org_id,
  has_organization, waba_connected,
  org_email, org_website, owner_name, owner_email,
  waba_status, waba_name, phone_number_id,   // ADD
}) => {
  if (access)  localStorage.setItem('accessToken', access);
  if (refresh) localStorage.setItem('refreshToken', refresh);

  localStorage.setItem('userRole', role ?? '');
  localStorage.setItem('userOrg', organization ?? '');
  localStorage.setItem('userOrgId', org_id ?? '');
  localStorage.setItem('hasOrganization', String(has_organization ?? false));
  localStorage.setItem('wabaConnected', String(waba_connected ?? false));
  localStorage.setItem('orgEmail', org_email ?? '');
  localStorage.setItem('orgWebsite', org_website ?? '');
  localStorage.setItem('ownerName', owner_name ?? '');
  localStorage.setItem('ownerEmail', owner_email ?? '');
  localStorage.setItem('wabaStatus', waba_status ?? '');
  localStorage.setItem('wabaName', waba_name ?? '');
  localStorage.setItem('phoneNumberId', phone_number_id ?? '');
};

const clearAuthFromStorage = () => {
  [
    'accessToken', 'refreshToken', 'userRole', 'userOrg', 'userOrgId',
    'hasOrganization', 'wabaConnected',
    'orgEmail', 'orgWebsite', 'ownerName', 'ownerEmail',
    'wabaStatus', 'wabaName', 'phoneNumberId',   
  ].forEach((k) => localStorage.removeItem(k));
};

// ─── Async thunks ────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_BASE_URL.endsWith('/') ? '' : '/'}api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detail || 'Invalid email or password');
      }

      const payload = {
        access: data.access,
        refresh: data.refresh,
        role: data.role ?? null,
        organization: data.organization ?? null,
        org_id: data.org_id ?? null,
        has_organization: data.has_organization ?? false,
        waba_connected: data.waba_connected ?? false,
        org_email: data.org_email ?? null,
        org_website: data.org_website ?? null,
        owner_name: data.owner_name ?? null,
        owner_email: data.owner_email ?? null,
        waba_status: data.waba_status ?? null,
        waba_name: data.waba_name ?? null,
        phone_number_id: data.phone_number_id ?? null,
      };

      saveAuthToStorage(payload);

      return payload;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      return rejectWithValue('No token');
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_BASE_URL.endsWith('/') ? '' : '/'}api/user/me/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        clearAuthFromStorage();
        return rejectWithValue('Token expired');
      }

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.detail || 'Failed to fetch profile');
      }

      const payload = {
        role: data.role ?? null,
        organization: data.organization ?? null,
        org_id: data.org_id ?? null,
        has_organization: data.has_organization ?? false,
        waba_connected: data.waba_connected ?? false,
        org_email: data.org_email ?? null,
        org_website: data.org_website ?? null,
        owner_name: data.owner_name ?? null,
        owner_email: data.owner_email ?? null,
        waba_status: data.waba_status ?? null,
        waba_name: data.waba_name ?? null,
        phone_number_id: data.phone_number_id ?? null,
      };

      saveAuthToStorage(payload);

      return payload;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ─── Initial state ───────────────────────────────────────────────────────────
const initialState = {
  email: '',
  isLoading: false,
  isMeLoading: false,
  error: null,
  isAuthenticated: false,

  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  role: localStorage.getItem('userRole') || null,
  organization: localStorage.getItem('userOrg') || null,
  org_id: localStorage.getItem('userOrgId') || null,

  has_organization:
    localStorage.getItem('hasOrganization') === 'true',

  waba_connected:
    localStorage.getItem('wabaConnected') === 'true',

  org_email: localStorage.getItem('orgEmail') || null,
  org_website: localStorage.getItem('orgWebsite') || null,
  owner_name: localStorage.getItem('ownerName') || null,
  owner_email: localStorage.getItem('ownerEmail') || null,
  waba_status: localStorage.getItem('wabaStatus') || null,
  waba_name: localStorage.getItem('wabaName') || null,
  phone_number_id: localStorage.getItem('phoneNumberId') || null,
};

// ─── Slice ───────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    resetAuthState: (state) => {
      state.email = '';
      state.error = null;
      state.isAuthenticated = false;
    },

    logout: () => {
      clearAuthFromStorage();

      return {
        ...initialState,
        accessToken: null,
        refreshToken: null,
        role: null,
        organization: null,
        org_id: null,
        has_organization: false,
        waba_connected: false,
        org_email: null,
        org_website: null,
        owner_name: null,
        owner_email: null,
        waba_status: null, waba_name: null, phone_number_id: null,
      };
    },
  },

  extraReducers: (builder) => {
    builder

      // ─── loginUser ──────────────────────────────────────────────────────
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.error = null;

        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.role = action.payload.role;
        state.organization = action.payload.organization;
        state.org_id = action.payload.org_id;
        state.has_organization = action.payload.has_organization;
        state.waba_connected = action.payload.waba_connected;

        state.org_email = action.payload.org_email;
        state.org_website = action.payload.org_website;
        state.owner_name = action.payload.owner_name;
        state.owner_email = action.payload.owner_email;

        state.waba_status = action.payload.waba_status;
        state.waba_name = action.payload.waba_name;
        state.phone_number_id = action.payload.phone_number_id;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // ─── fetchMe ────────────────────────────────────────────────────────
      .addCase(fetchMe.pending, (state) => {
        state.isMeLoading = true;
      })

      .addCase(fetchMe.fulfilled, (state, action) => {
        state.isMeLoading = false;

        state.role = action.payload.role;
        state.organization = action.payload.organization;
        state.org_id = action.payload.org_id;
        state.has_organization = action.payload.has_organization;
        state.waba_connected = action.payload.waba_connected;

        state.org_email = action.payload.org_email;
        state.org_website = action.payload.org_website;
        state.owner_name = action.payload.owner_name;
        state.owner_email = action.payload.owner_email;

        state.waba_status = action.payload.waba_status;
        state.waba_name = action.payload.waba_name;
        state.phone_number_id = action.payload.phone_number_id;
      })

      .addCase(fetchMe.rejected, (state, action) => {
        state.isMeLoading = false;

        if (action.payload === 'Token expired') {
          state.accessToken = null;
          state.refreshToken = null;
          state.role = null;
          state.organization = null;
        }
      });
  },
});

export const {
  clearError,
  resetAuthState,
  logout,
} = authSlice.actions;

export default authSlice.reducer;