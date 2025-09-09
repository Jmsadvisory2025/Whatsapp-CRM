import React from "react";
import { Provider } from 'react-redux';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { store } from './store/store';
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Prospects from "./pages/Prospects";
import Patients from "./pages/Patients";
import Reminders from "./pages/Reminders";
import SignIn from "./pages/SignIn";
import Verification from "./pages/Verification";
import CreateOrganization from "./pages/CreateOrganization";
import LeadInfo from "./pages/LeadInfo";
import Team from "./pages/Team";
import Whatsapp from "./pages/Whatsapp";
import AddMember from "./subpages/AddMember";

import useErrorRedirect from "./hooks/useErrorRedirect";
import ErrorPage from "./pages/ErrorPage";

const router = createBrowserRouter([
  // Public routes (no auth required)
  { path: "/signin", element: <SignIn /> },
  
  // Verification route (requires sign-in)
  {
    path: "/verify",
    element: (
      // <RequireSignIn>
        <Verification />
      // </RequireSignIn> 
    ),
  },
  
  // Setup route (requires sign-in and verification)
  {
    path: "/setup",
    element: (
      //<RequireSignIn>
        //<RequireVerification>
          <CreateOrganization />
        //</RequireVerification>
      //</RequireSignIn>
    ),
  },
  
  // Protected app routes (requires sign-in, verification, and organization)
  {
    path: "/",
    element: (
      // <RequireSignIn>
        //<RequireVerification>
          //<RequireOrganization>
            <AppLayout />
          //</RequireOrganization> 
        //</RequireVerification>
      // </RequireSignIn>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'leads', element: <Leads /> },
      { path: 'leads/:leadId', element: <LeadInfo /> },
      { path: 'prospects', element: <Prospects /> },
      { path: 'patients', element: <Patients /> },
      { path: 'reminders', element: <Reminders /> },
      { path: 'team', element: <Team /> },
      { path: 'whatsapp', element: <Whatsapp /> },
      { path: 'addMember', element: <AddMember /> },
    ],
    errorElement: <ErrorPage />, // Handle errors within protected routes
  },
  
  // Dynamic error route for specific status codes
  { path: "/error/:status", element: <ErrorPage /> },
  
  // Catch all - redirect to signin or error page
  { path: "*", element: <Navigate to="/error/404" replace /> },
]);

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
      <useErrorRedirect /> {/* Global error redirect hook */}
    </Provider>
  );
}

export default App;