import React, { Suspense, lazy } from "react";
import { Provider } from 'react-redux';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { store } from './store/store';
import LoaderDemo from "./components/ui/ProfessionalMedicalLoader ";

// Simple Loading Component
// const Loading = () => (
//   <div className="flex items-center justify-center min-h-screen">
//     <div className="flex flex-col items-center space-y-4">
//       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       <p className="text-gray-600">Loading...</p>
//     </div>
//   </div>
// );

// Lazy load components for better performance
const LandingPage = lazy(() => import("./pages/LandingPage"));
const SignUp = lazy(() => import("./pages/SignUp"));
const SignIn = lazy(() => import("./pages/SignIn"));
const Verification = lazy(() => import("./pages/Verification"));
const CreateOrganization = lazy(() => import("./pages/CreateOrganization"));
const AppLayout = lazy(() => import("./components/layout/AppLayout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Leads = lazy(() => import("./pages/Leads"));
const Prospects = lazy(() => import("./pages/Prospects"));
const Patients = lazy(() => import("./pages/Patients"));
const Reminders = lazy(() => import("./pages/Reminders"));
const LeadInfo = lazy(() => import("./pages/LeadInfo"));
const Team = lazy(() => import("./pages/Team"));
const Whatsapp = lazy(() => import("./pages/Whatsapp"));
const AddMember = lazy(() => import("./subpages/AddMember"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const VoiceBot = lazy(() => import("./pages/VoiceBot"));
const HomeResolver = lazy(() =>import("./components/guards/HomeResolver"));
// Define routes with appropriate access control  
const router = createBrowserRouter([
  // Public routes (no auth required)
 
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
      <Suspense fallback={ <LoaderDemo   />}>
        <SignIn />
      </Suspense>
    )
  },
  
  // Verification route (requires sign-in)
  {
    path: "/verify",
    element: (
      <Suspense fallback={<LoaderDemo   />}>
        {/* <RequireSignIn> */}
          <Verification />
        {/* </RequireSignIn> */}
      </Suspense>
    ),
  },
  
  // Setup route (requires sign-in and verification)
  {
    path: "/setup",
    element: (
      <Suspense fallback={<LoaderDemo   />}>
        {/* <RequireSignIn> */}
          {/* <RequireVerification> */}
            <CreateOrganization />
          {/* </RequireVerification> */}
        {/* </RequireSignIn> */}
      </Suspense>
    ),
  },
  
  // Protected app routes (requires sign-in, verification, and organization)
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
          <Suspense fallback={
              <LoaderDemo   />
          // <Loading />
          }>
            <Dashboard />
          </Suspense>
        )
      },
      { 
        path: 'leads', 
        element: (
          <Suspense fallback={ <LoaderDemo   />}>
            <Leads />
          </Suspense>
        )
      },
      { 
        path: 'leads/:leadId', 
        element: (
          <Suspense fallback={<LoaderDemo   />}>
            <LeadInfo />
          </Suspense>
        )
      },
      { 
        path: 'prospects', 
        element: (
          <Suspense fallback={<LoaderDemo   />}>
            <Prospects />
          </Suspense>
        )
      },
      { 
        path: 'patients', 
        element: (
          <Suspense fallback={<LoaderDemo   />}>
            <Patients />
          </Suspense>
        )
      },
      { 
        path: 'reminders', 
        element: (
          <Suspense fallback={<LoaderDemo   />}>
            <Reminders />
          </Suspense>
        )
      },
      { 
        path: 'team', 
        element: (
          <Suspense fallback={<LoaderDemo   />}>
            <Team />
          </Suspense>
        )
      },
      { 
        path: 'whatsapp', 
        element: (
          <Suspense fallback={<LoaderDemo   />}>
            <Whatsapp />
          </Suspense>
        )
      },
      { 
        path: 'addMember', 
        element: (
          <Suspense fallback={<LoaderDemo   />}>
            <AddMember />
          </Suspense>
        )
      },
    ],
    errorElement: (
      <Suspense fallback={<LoaderDemo   />}>
        <ErrorPage />
      </Suspense>
    ),
    
  },
  
  // Dynamic error route for specific status codes
  { 
    path: "/error/:status", 
    element: (
      <Suspense fallback={<LoaderDemo   />}>
        <ErrorPage />
      </Suspense>
    )
  },
  {
    path: "/voicebot",
    element: (
      <VoiceBot />
    ),
  },
  
  // Catch all - redirect to signin or error page
  { path: "*", element: <Navigate to="/error/404" replace /> },
]);

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;