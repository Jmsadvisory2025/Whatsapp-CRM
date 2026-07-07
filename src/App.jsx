import React, { Suspense, lazy } from "react";
import { Provider } from 'react-redux';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { store } from './store/store';
import LoaderDemo from "./components/ui/ProfessionalMedicalLoader ";

const TechProviderClients = lazy(() => import("./pages/TechProviderClients"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const SignUp = lazy(() => import("./pages/SignUp"));
const SignIn = lazy(() => import("./pages/SignIn"));

const CreateOrganization = lazy(() => import("./pages/CreateOrganization"));
const AppLayout = lazy(() => import("./components/layout/AppLayout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const LeadsProspects = lazy(() => import("./pages/LeadsProspects"));
const Team = lazy(() => import("./pages/Team"));
const Whatsapp = lazy(() => import("./pages/Whatsapp"));
const AddMember = lazy(() => import("./subpages/AddMember"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const Templates = lazy(() => import("./pages/Templates"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const Campaign = lazy(() => import("./pages/Campaign"));
const HomeResolver = lazy(() => import("./components/guards/HomeResolver"));
const ConnectedBusinessDetails = lazy(() => import("./pages/ConnectedBusinessDetails"))
const MetaRegistration = lazy(() => import("./pages/MetaRegistration"));
const router = createBrowserRouter(
  [
    // Public routes
    {
      path: "/signup",
      errorElement: (
        <Suspense fallback={<LoaderDemo />}>
          <ErrorPage />
        </Suspense>
      ),
      element: (
        <Suspense fallback={<LoaderDemo />}>
          <SignUp />
        </Suspense>
      ),
    },
    {
      path: "/signin",
      errorElement: (
        <Suspense fallback={<LoaderDemo />}>
          <ErrorPage />
        </Suspense>
      ),
      element: (
        <Suspense fallback={<LoaderDemo />}>
          <SignIn />
        </Suspense>
      ),
    },

    {
      path: "/setup",
      errorElement: (
        <Suspense fallback={<LoaderDemo />}>
          <ErrorPage />
        </Suspense>
      ),
      element: (
        <Suspense fallback={<LoaderDemo />}>
          <CreateOrganization />
        </Suspense>
      ),
    },
    {
      path: "/connected-business",
      errorElement: (
        <Suspense fallback={<LoaderDemo />}>
          <ErrorPage />
        </Suspense>
      ),
      element: (
        <Suspense fallback={<LoaderDemo />}>
          <ConnectedBusinessDetails />
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
          path: "leads-prospects",
          element: (
            <Suspense fallback={<LoaderDemo />}>
              <LeadsProspects />
            </Suspense>
          ),
        },
        // Old routes redirect to leads-prospects
        { path: "leads", element: <Navigate to="/leads-prospects" replace /> },
        { path: "prospects", element: <Navigate to="/leads-prospects" replace /> },

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
          path: "campaign",
          element: (
            <Suspense fallback={<LoaderDemo />}>
              <Campaign />
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
          path: "meta-registration",
          element: (
            <Suspense fallback={<LoaderDemo />}>
              <MetaRegistration />
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
          path: "addMember",
          element: (
            <Suspense fallback={<LoaderDemo />}>
              <AddMember />
            </Suspense>
          ),
        },
        {
          path: "clients",
          element: (
            <Suspense fallback={<LoaderDemo />}>
              <TechProviderClients />
            </Suspense>
          ),
        },
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

    // Catch all
    { path: "*", element: <Navigate to="/error/404" replace /> },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

function App() {
  if (
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1" &&
    window.location.hostname !== "whatsapp.naavya.ai"
  ) {
    window.location.replace("https://whatsapp.naavya.ai" + window.location.pathname + window.location.search);
    return null;
  }

  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;