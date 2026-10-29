import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchMe } from "../../store/authSlice";

const AppLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [initialAuthChecked, setInitialAuthChecked] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { accessToken, waba_connected } = useSelector((s) => s.auth);
  const wabaConnected =
    waba_connected ?? localStorage.getItem("wabaConnected") === "true";

  // ── On mount: rehydrate role / org / waba status from backend once ────────
  useEffect(() => {
    if (accessToken) {
      dispatch(fetchMe())
        .unwrap()
        .then((profile) => {
          const skipSetup = localStorage.getItem("skip_setup") === "true";
          if (!profile.has_organization && !skipSetup) {
            navigate("/setup", { replace: true });
          }
        })
        .catch(() => {
          // Token expired or invalid — guard will redirect
        })
        .finally(() => {
          setInitialAuthChecked(true);
        });
    } else {
      setInitialAuthChecked(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!initialAuthChecked) {
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

      <div className="flex flex-1 flex-col overflow-hidden bg-[#FAFAFC]">
        {/* Mobile-only header for sidebar drawer toggle */}
        <header className="h-14 px-4 bg-white border-b border-[#E5E7EB] flex items-center justify-between z-10 sticky top-0 lg:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-slate-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
            <span className="font-semibold text-sm text-[#172033] capitalize tracking-tight">
              {location.pathname === "/"
                ? "Dashboard"
                : location.pathname === "/leads-prospects"
                  ? "Customers"
                  : location.pathname === "/whatsapp"
                    ? "Inbox"
                    : location.pathname === "/templates"
                      ? "Message Templates"
                      : location.pathname === "/team"
                        ? "Profile"
                        : location.pathname.replace("/", "").replace(/-/g, " ")}
            </span>
          </div>

          {/* Minimal WhatsApp status dot */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                wabaConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span>{wabaConnected ? "Active" : "Offline"}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
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
