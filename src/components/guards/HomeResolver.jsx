import React from "react";
import { useSelector } from "react-redux";

import LandingPage from "../../pages/LandingPage";
import AppLayout from "../layout/AppLayout";

const HomeResolver = () => {
  const accessToken = localStorage.getItem("accessToken");

  // NOT LOGGED IN
  if (!accessToken) {
    return <LandingPage />;
  }

  // LOGGED IN
  return <AppLayout />;
};

export default HomeResolver;