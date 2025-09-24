import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Async thunk to fetch patients
export const fetchPatients = createAsyncThunk(
  'patients/fetch',
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();
    // console.log(auth)
    const token = auth.accessToken || localStorage.getItem('accessToken');

    if (!token) {
      throw new Error('No authentication token available');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/patients/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      //  console.log("patient data", data);
      if (!response.ok) {
        throw new Error(data.message || 'Sorry , you are not the part of the organization');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  patients: [],
  isLoading: false,
  error: null,
};

const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    clearPatientsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.patients = action.payload || [];
        state.error = null;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPatientsError } = patientsSlice.actions;
export default patientsSlice.reducer;