import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Async thunk to fetch all team members
const fetchTeamMembers = createAsyncThunk(
  "team/fetchMembers",
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.accessToken || localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("No authentication token available");
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/organization/members/list/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      // console.log("team members data", data);
      if (!response.ok) {
        throw new Error(
          data.message ||
            "OOPS  •︵•  You don't have permission to view team members "
        );
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to delete a team member
const deleteTeamMember = createAsyncThunk(
  "team/deleteMember",
  async (id, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.accessToken || localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("No authentication token available");
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/organization/members/${id}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete team member");
      }

      return id; // Return the deleted member's ID
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to update a team member
const updateTeamMember = createAsyncThunk(
  "team/updateMember",
  async ({ id, full_name, new_email, role }, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.accessToken || localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("No authentication token available");
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/organization/members/${id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ full_name, new_email, role }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update team member");
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to add a new team member
const addTeamMember = createAsyncThunk(
  "team/addMember",
  async ({ full_name, new_email, role }, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.accessToken || localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("No authentication token available");
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/organization/members/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ full_name, new_email, role }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add team member");
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  members: [],
  isLoading: false,
  error: null,
};

const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    clearTeamError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeamMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members = action.payload || [];
        state.error = null;
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteTeamMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTeamMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members = state.members.filter(
          (member) => member.id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteTeamMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateTeamMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTeamMember.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedMember = action.payload;
        state.members = state.members.map((member) =>
          member.id === updatedMember.id
            ? { ...member, ...updatedMember }
            : member
        );
        state.error = null;
      })
      .addCase(updateTeamMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addTeamMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addTeamMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members.push(action.payload);
        state.error = null;
      })
      .addCase(addTeamMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTeamError } = teamSlice.actions;
export { fetchTeamMembers, deleteTeamMember, updateTeamMember, addTeamMember };
export default teamSlice.reducer;
