import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";
import AppLayout from "../layout/AppLayout";
import LandingPage from "../../pages/LandingPage";
import LoaderDemo from "../ui/ProfessionalMedicalLoader ";
import { isTechProvider } from "../../store/authUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const HomeResolver = () => {
  const [status, setStatus] = useState("loading");
  const token = localStorage.getItem("accessToken");

  useEffect(() => {

  if (!token) {
    setStatus("guest");
    return;
  }

  const checkUser = async () => {

    try {

      const { data } = await axios.get(
        `${API_BASE_URL}api/user/me/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // TECH PROVIDER
      if (isTechProvider(data.email)) {

        try {

  await axios.post(
    `${API_BASE_URL}api/sync-tech-provider-waba/`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log("WABA synced successfully");

} catch (err) {

  console.log(
    "WABA sync failed",
    err?.response?.data || err
  );
}

        setStatus("ready");
        return;
      }

      // CLIENT
      if (!data.has_organization) {
        setStatus("no_org");
      } else {
        setStatus("ready");
      }

    } catch (err) {

      if (err?.response?.status === 401) {

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

      }

      setStatus("guest");
    }
  };

  checkUser();

}, []);

  if (status === "loading") return <LoaderDemo />;
  if (status === "guest")   return <LandingPage />;
  if (status === "no_org")  return <Navigate to="/setup" replace />;

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

export default HomeResolver;