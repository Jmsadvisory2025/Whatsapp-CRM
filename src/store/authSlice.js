// store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Async thunks for API calls
export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (email, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-code/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }
      
      return { email, message: data.message };
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }
      
      // Store tokens in localStorage
      if (data.access && data.refresh) {
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
      }
      
      return {
        access: data.access,
        refresh: data.refresh,
        role: data.role,
        organization: data.organization,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  email: '',
  otp: '',
  isLoading: false,
  error: null,
  isVerified: false,
  otpSent: false,
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  role: null,
  organization: null,
  otpExpiryTime: null, // Timestamp when OTP expires
};

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
    logout: (state) => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send OTP cases
      .addCase(sendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.email = action.payload.email;
        state.otpSent = true;
        state.error = null;
        // Set OTP expiry time (5 minutes from now)
        state.otpExpiryTime = Date.now() + 5 * 60 * 1000;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.otpSent = false;
      })
      // Verify OTP cases
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
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isVerified = false;
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

// Legacy action creators for backward compatibility (if needed)
export const sendOtpStart = () => ({ type: 'auth/sendOtp/pending' });
export const sendOtpSuccess = (email) => ({ 
  type: 'auth/sendOtp/fulfilled', 
  payload: { email, message: 'OTP sent successfully' } 
});
export const sendOtpFailure = (error) => ({ 
  type: 'auth/sendOtp/rejected', 
  payload: error 
});

export const verifyOtpStart = () => ({ type: 'auth/verifyOtp/pending' });
export const verifyOtpSuccess = () => ({ type: 'auth/verifyOtp/fulfilled', payload: {} });
export const verifyOtpFailure = (error) => ({ 
  type: 'auth/verifyOtp/rejected', 
  payload: error 
});

export default authSlice.reducer;