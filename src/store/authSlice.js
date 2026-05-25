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
}) => {
  if (access)  localStorage.setItem('accessToken', access);
  if (refresh) localStorage.setItem('refreshToken', refresh);

  localStorage.setItem('userRole', role ?? '');
  localStorage.setItem('userOrg', organization ?? '');
  localStorage.setItem('userOrgId', org_id ?? '');
  localStorage.setItem('hasOrganization', String(has_organization ?? false));
  localStorage.setItem('wabaConnected', String(waba_connected ?? false));

  // NEW
  localStorage.setItem('orgEmail', org_email ?? '');
  localStorage.setItem('orgWebsite', org_website ?? '');
  localStorage.setItem('ownerName', owner_name ?? '');
  localStorage.setItem('ownerEmail', owner_email ?? '');
};

const clearAuthFromStorage = () => {
  [
    'accessToken',
    'refreshToken',
    'userRole',
    'userOrg',
    'userOrgId',
    'hasOrganization',
    'wabaConnected',
    'orgEmail',
    'orgWebsite',
    'ownerName',
    'ownerEmail',
  ].forEach((k) => localStorage.removeItem(k));
};

// ─── Async thunks ────────────────────────────────────────────────────────────

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (email, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      return {
        email,
        message: data.message,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, code }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      const payload = {
        access: data.access,
        refresh: data.refresh,
        role: data.role ?? null,
        organization: data.organization ?? null,
        org_id: data.org_id ?? null,
        has_organization: data.has_organization ?? false,
        waba_connected: data.waba_connected ?? false,

        // NEW
        org_email: data.org_email ?? null,
        org_website: data.org_website ?? null,
        owner_name: data.owner_name ?? null,
        owner_email: data.owner_email ?? null,
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
      const response = await fetch(`${API_BASE_URL}/api/user/me/`, {
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

        // NEW
        org_email: data.org_email ?? null,
        org_website: data.org_website ?? null,
        owner_name: data.owner_name ?? null,
        owner_email: data.owner_email ?? null,
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
  otp: '',
  isLoading: false,
  isMeLoading: false,
  error: null,
  isVerified: false,
  otpSent: false,

  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  role: localStorage.getItem('userRole') || null,
  organization: localStorage.getItem('userOrg') || null,
  org_id: localStorage.getItem('userOrgId') || null,

  has_organization:
    localStorage.getItem('hasOrganization') === 'true',

  waba_connected:
    localStorage.getItem('wabaConnected') === 'true',

  otpExpiryTime: null,

  // NEW
  org_email: localStorage.getItem('orgEmail') || null,
  org_website: localStorage.getItem('orgWebsite') || null,
  owner_name: localStorage.getItem('ownerName') || null,
  owner_email: localStorage.getItem('ownerEmail') || null,
};

// ─── Slice ───────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    setOtp: (state, action) => {
      state.otp = action.payload;
      state.error = null;
    },

    setOtpExpiryTime: (state, action) => {
      state.otpExpiryTime = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    resetAuthState: (state) => {
      state.email = '';
      state.otp = '';
      state.error = null;
      state.isVerified = false;
      state.otpSent = false;
      state.otpExpiryTime = null;
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
      };
    },
  },

  extraReducers: (builder) => {
    builder

      // ─── sendOtp ────────────────────────────────────────────────────────
      .addCase(sendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(sendOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.email = action.payload.email;
        state.otpSent = true;
        state.error = null;
        state.otpExpiryTime = Date.now() + 5 * 60 * 1000;
      })

      .addCase(sendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.otpSent = false;
      })

      // ─── verifyOtp ──────────────────────────────────────────────────────
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isVerified = true;
        state.error = null;

        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.role = action.payload.role;
        state.organization = action.payload.organization;
        state.org_id = action.payload.org_id;
        state.has_organization = action.payload.has_organization;
        state.waba_connected = action.payload.waba_connected;

        // NEW
        state.org_email = action.payload.org_email;
        state.org_website = action.payload.org_website;
        state.owner_name = action.payload.owner_name;
        state.owner_email = action.payload.owner_email;
      })

      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isVerified = false;
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

        // NEW
        state.org_email = action.payload.org_email;
        state.org_website = action.payload.org_website;
        state.owner_name = action.payload.owner_name;
        state.owner_email = action.payload.owner_email;
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
  setOtp,
  setOtpExpiryTime,
  clearError,
  resetAuthState,
  logout,
} = authSlice.actions;

export default authSlice.reducer;