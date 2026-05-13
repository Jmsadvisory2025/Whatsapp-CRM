import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialVoiceState = {
  query: "",
  response: null,
  audioUrl: null,
  sessionId: null,
  loading: false,
  error: null,
};

// const initialVoiceState = {
//   query: "",
//   response: null,
//   audioUrl: null,
//   sessionId: null,
//   loading: false,
//   error: null,
// };

// Define the async thunk
export const initiateChat = createAsyncThunk(
  "voice/initiateChat",
  async (payload, { getState, rejectWithValue }) => {
    try {
      // Safe casting to access the state without importing RootState to avoid circular dependency
      // We know the structure based on store configuration
      const state = getState();
      const sessionId = state.voicebot.sessionId;

      const body = {};

      if (payload.start) {
        body.start = true;
        body.language = payload.language;
      } else {
        body.query = payload.text;
      }

      if (sessionId) {
        body.session_id = sessionId;
      }

      const response = await axios.post(
        "https://meta-crm-cegxf2gddnhxhcdk.centralindia-01.azurewebsites.net/voicechat/api/assistant/",
        body,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "An unknown error occurred");
    }
  },
);

const voiceSlice = createSlice({
  name: "voicebot",
  initialState: initialVoiceState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initiateChat.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        if (action.meta.arg.text) {
          state.query = action.meta.arg.text;
        }
      })
      .addCase(initiateChat.fulfilled, (state, action) => {
        state.loading = false;
        state.sessionId = action.payload.session_id;
        state.response = action.payload.response;
        // The API returns 'audio_url', ensuring we map it correctly
        state.audioUrl = action.payload.audio_url || null;
      })
      .addCase(initiateChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default voiceSlice.reducer;
