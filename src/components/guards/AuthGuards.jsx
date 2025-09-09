// components/guards/AuthGuards.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Guard to require sign-in (access token)
// export const RequireSignIn = ({ children }) => {
//   const accessToken = localStorage.getItem('accessToken');
  
//   if (!accessToken) {
//     return <Navigate to="/signin" replace />;
//   }
  
//   return children;
// };

// Guard to require verification (after sign-in)
export const RequireVerification = ({ children }) => {
  const { isVerified, email } = useSelector((state) => state.auth);
  const accessToken = localStorage.getItem('accessToken');
  console.log(accessToken)
  // If no access token, redirect to sign in
  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }
  
  // If signed in but not verified and has email (OTP sent), go to verify
  if (!isVerified && email) {
    return <Navigate to="/verify" replace />;
  }
  
  // If signed in but no email (haven't sent OTP), go to signin
  if (!isVerified && !email) {
    return <Navigate to="/signin" replace />;
  }
  
  return children;
};

// Guard to require organization setup
export const RequireOrganization = ({ children }) => {
  const { organization, isCreated } = useSelector((state) => state.organization);
  const { isVerified } = useSelector((state) => state.auth);
  const accessToken = localStorage.getItem('accessToken');
  
  // If no access token, redirect to sign in
  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }
  
  // If not verified, redirect to verification flow
  if (!isVerified) {
    return <Navigate to="/signin" replace />;
  }
  
  // If verified but no organization created, redirect to setup
  if (!organization && !isCreated) {
    return <Navigate to="/setup" replace />;
  }
  
  return children;
};