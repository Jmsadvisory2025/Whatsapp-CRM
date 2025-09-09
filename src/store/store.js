import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import organizationReducer from './organizationSlice';
import dashboardReducer from './dashboardSlice';
import leadsReducer from './leadsSlice';
import prospectsReducer from './prospectsSlice';
import patientsReducer from './patientsSlice';
import teamReducer from './teamSlice'; // Add this line

export const store = configureStore({
  reducer: {
    auth: authReducer,
    organization: organizationReducer,
    dashboard: dashboardReducer,
    leads: leadsReducer,
    prospects: prospectsReducer,
    patients: patientsReducer,
    team: teamReducer, // Add this line
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export default store;