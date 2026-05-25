import React, { Suspense, lazy } from "react";
import { Provider } from 'react-redux';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { store } from './store/store';
import LoaderDemo from "./components/ui/ProfessionalMedicalLoader ";

// Lazy load components for better performance
const LandingPage    = lazy(() => import("./pages/LandingPage"));
const SignUp         = lazy(() => import("./pages/SignUp"));
const SignIn         = lazy(() => import("./pages/SignIn"));
const Verification   = lazy(() => import("./pages/Verification"));
const CreateOrganization = lazy(() => import("./pages/CreateOrganization"));
const AppLayout      = lazy(() => import("./components/layout/AppLayout"));
const Dashboard      = lazy(() => import("./pages/Dashboard"));
const Leads          = lazy(() => import("./pages/Leads"));
const Prospects      = lazy(() => import("./pages/Prospects"));
const Reminders      = lazy(() => import("./pages/Reminders"));
const LeadInfo       = lazy(() => import("./pages/LeadInfo"));
const Team           = lazy(() => import("./pages/Team"));
const Whatsapp       = lazy(() => import("./pages/Whatsapp"));
const AddMember      = lazy(() => import("./subpages/AddMember"));
const ErrorPage      = lazy(() => import("./pages/ErrorPage"));
const VoiceBot       = lazy(() => import("./pages/VoiceBot"));
const Templates      = lazy(() => import("./pages/Templates"));
const KnowledgeBase  = lazy(() => import("./pages/KnowledgeBase"));
const Campaign       = lazy(() => import("./pages/Campaign"));
const HomeResolver   = lazy(() => import("./components/guards/HomeResolver"));
const LeadsProspects = lazy(() => import("./pages/LeadsProspects"));

const router = createBrowserRouter(
  [
    // Public routes
    {
      path: "/signup",
      element: (
        <Suspense fallback={<LoaderDemo />}>
          <SignUp />
        </Suspense>
      ),
    },
    {
      path: "/signin",
      element: (
        <Suspense fallback={<LoaderDemo />}>
          <SignIn />
        </Suspense>
      ),
    },

    // Verification
    {
      path: "/verify",
      element: (
        <Suspense fallback={<LoaderDemo />}>
          <Verification />
        </Suspense>
      ),
    },

    // Setup
    {
      path: "/setup",
      element: (
        <Suspense fallback={<LoaderDemo />}>
          <CreateOrganization />
        </Suspense>
      ),
    },

    // Protected app routes
    {
      path: "/",
      element: (
        <Suspense fallback={<LoaderDemo />}>
          <HomeResolver />
        </Suspense>
      ),
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<LoaderDemo />}>
              <Dashboard />
            </Suspense>
          ),
        },
        {
          path: "leads",
          element: (
            <Suspense fallback={<LoaderDemo />}>
              <Leads />
            </Suspense>
          ),
        },
        {
          path: "leads/:leadId",
          element: (
            <Suspense fallback={<LoaderDemo />}>
              <LeadInfo />
            </Suspense>
          ),
        },
        {
          path: "prospects",
          element: (
            <Suspense fallback={<LoaderDemo />}>
              <Prospects />
            </Suspense>
          ),
        },
        {
          path: "reminders",
          element: (
            <Suspense fallback={<LoaderDemo />}>
              <Reminders />
            </Suspense>
          ),
        },
        {
          path: "team",
          element: (
            <Suspense fallback={<LoaderDemo />}>
              <Team />
            </Suspense>
          ),
        },
        {
          path: "whatsapp",
          element: (
            <Suspense fallback={<LoaderDemo />}>
              <Whatsapp />
            </Suspense>
          ),
        },
        {
          path: "templates",
          element: (
            <Suspense fallback={<LoaderDemo />}>
              <Templates />
            </Suspense>
          ),
        },
        {
          path: "addMember",
          element: (
            <Suspense fallback={<LoaderDemo />}>
              <AddMember />
            </Suspense>
          ),
        },
        {
          path: "knowledge-base",
          element: (
            <Suspense fallback={<LoaderDemo />}>
              <KnowledgeBase />
            </Suspense>
          ),
        },
        {
          path: "campaign",
          element: (
            <Suspense fallback={<LoaderDemo />}>
              <Campaign />
            </Suspense>
          ),
        },
        {
  path: "leads-prospects",
  element: (
    <Suspense fallback={<LoaderDemo />}>
      <LeadsProspects />
    </Suspense>
  ),
}
      ],
      errorElement: (
        <Suspense fallback={<LoaderDemo />}>
          <ErrorPage />
        </Suspense>
      ),
    },

    // Error page
    {
      path: "/error/:status",
      element: (
        <Suspense fallback={<LoaderDemo />}>
          <ErrorPage />
        </Suspense>
      ),
    },
    {
      path: "/voicebot",
      element: <VoiceBot />,
    },

    // Catch all
    { path: "*", element: <Navigate to="/error/404" replace /> },
  ],
  {
    // ✅ ADD THIS BLOCK - Future flags configuration
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;