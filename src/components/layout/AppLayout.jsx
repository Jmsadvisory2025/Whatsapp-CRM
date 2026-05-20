import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchMe } from "../../store/authSlice";

const AppLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed]   = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  const { accessToken, has_organization, isMeLoading } = useSelector((s) => s.auth);

  // ── On mount: rehydrate role / org / waba status from backend ────────────
  // This fixes the "403 after page refresh" issue. The JWT in localStorage
  // is valid, but Redux lost role/org state on reload. fetchMe restores it.
  useEffect(() => {
    if (accessToken) {
      dispatch(fetchMe())
        .unwrap()
        .then((profile) => {
          // After rehydration: if org not set up yet, send to /setup
          if (!profile.has_organization) {
            navigate("/setup", { replace: true });
          }
        })
        .catch(() => {
          // Token expired or invalid — RequireSignIn guard will redirect
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // While fetchMe is in flight on first load, render nothing (avoids flicker)
  if (isMeLoading) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background text-text-primary font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar isCollapsed={isCollapsed} onToggle={setIsCollapsed} />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-30 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-40 lg:hidden"
            >
              <Sidebar isCollapsed={false} onToggle={() => {}} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 bg-surface border-b lg:hidden">
          <span className="font-bold text-xl text-primary">TechNova CRM</span>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;