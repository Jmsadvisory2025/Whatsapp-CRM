import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import organizationReducer from './organizationSlice';
import dashboardReducer from './dashboardSlice';
import teamReducer from './teamSlice';
import whatsappReducer from './whatsappSlice';
import metaConnectReducer from './metaConnectSlice';
import templateReducer from './templateSlice';
import knowledgeBaseReducer from './knowledgeBaseSlice';
import campaignReducer from './campaignSlice';
import techProviderReducer from "./techProviderSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    organization: organizationReducer,
    dashboard: dashboardReducer,
    team: teamReducer,
    whatsapp: whatsappReducer,
    metaConnect: metaConnectReducer,
    templates: templateReducer,
    knowledgeBase: knowledgeBaseReducer,
    campaign: campaignReducer,
    techProvider: techProviderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export default store;