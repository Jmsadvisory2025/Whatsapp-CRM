import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = 'https://mcrm-cbe4exh8ghdheben.centralindia-01.azurewebsites.net';

// Async thunk to fetch confirmed leads
const fetchConfirmedLeads = createAsyncThunk(
  'leads/fetchConfirmed',
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.accessToken || localStorage.getItem('accessToken');

    if (!token) {
      throw new Error('No authentication token available');
    }

    try {
      const response = await fetch(`${BASE_URL}/api/v1/leads/confirmed/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("leads data", data);
      if (!response.ok) {
        throw new Error(data.message || 'Sorry , you are not the part of the organization');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to convert lead to patient
const convertToPatient = createAsyncThunk(
  'leads/convertToPatient',
  async ({ conversation_id }, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.accessToken || localStorage.getItem('accessToken');

    if (!token) {
      throw new Error('No authentication token available');
    }

    try {
      const response = await fetch(`${BASE_URL}/api/v1/leads/convert-to-patient/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ conversation_id }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to convert lead to patient');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to update lead (edit button)
const updateLeadAction = createAsyncThunk(
  'leads/updateAction',
  async (payload, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.accessToken || localStorage.getItem('accessToken');
    const { conversation_id, phone, disease, visit_date, visit_time, relation, status, reminder_note } = payload;

    if (!token) {
      throw new Error('No authentication token available');
    }

    try {
      const response = await fetch(`${BASE_URL}/api/v1/leads/confirmed/${conversation_id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone,
          disease,
          visit_date,
          visit_time,
          relation,
          status,
          reminder_date: null,
          reminder_type: null,
          reminder_note,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update lead');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// New async thunk for dropdown actions with reminder
const updateLeadActionWithReminder = createAsyncThunk(
  'leads/updateActionWithReminder',
  async (payload, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.accessToken || localStorage.getItem('accessToken');
    const { conversation_id, action, reminder_note } = payload;

    if (!token) {
      throw new Error('No authentication token available');
    }

    try {
      const response = await fetch(`${BASE_URL}/api/v1/leads/${conversation_id}/action/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          reminder_note: reminder_note || undefined,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update lead action');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  leads: [],
  isLoading: false,
  error: null,
};

const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    clearLeadsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfirmedLeads.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConfirmedLeads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leads = action.payload || [];
        state.error = null;
      })
      .addCase(fetchConfirmedLeads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(convertToPatient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(convertToPatient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leads = state.leads.filter(
          (l) => l.conversation_id !== action.meta.arg.conversation_id
        );
        state.error = null;
      })
      .addCase(convertToPatient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateLeadAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLeadAction.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedLead = action.payload;
        state.leads = state.leads.map(l =>
          l.conversation_id === updatedLead.conversation_id ? { ...l, ...updatedLead } : l
        );
        state.error = null;
      })
      .addCase(updateLeadAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateLeadActionWithReminder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLeadActionWithReminder.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedLead = action.payload;
        state.leads = state.leads.map(l =>
          l.conversation_id === updatedLead.conversation_id ? { ...l, ...updatedLead } : l
        );
        state.error = null;
      })
      .addCase(updateLeadActionWithReminder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearLeadsError } = leadsSlice.actions;
export { fetchConfirmedLeads, convertToPatient, updateLeadAction, updateLeadActionWithReminder };
export default leadsSlice.reducer;