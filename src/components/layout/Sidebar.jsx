import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  TrendingUp,
  PanelLeftClose,
  PanelLeftOpen,
  Users2,
  FileText,
  Megaphone,
  LogOut,
  Building2,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import jmsLogo from "../../assets/jms.png";
import { isTechProvider } from "../../store/authUtils";

const baseNavItems = [
  { icon: LayoutDashboard, label: "Dashboard",         path: "/" },
  { icon: TrendingUp,      label: "Leads & Prospects",  path: "/leads-prospects" },
  { icon: FaWhatsapp,      label: "Whatsapp",           path: "/whatsapp" },
  { icon: FileText,        label: "Templates",          path: "/templates" },
  { icon: Megaphone,       label: "Campaign",           path: "/campaign" },
  { icon: Users2,          label: "Profile",            path: "/team" },
];

const techProviderItem = { icon: Building2, label: "Clients", path: "/clients" };

const Sidebar = ({ onToggle = () => {} }) => {
  const navigate = useNavigate();

  const reduxOrg  = useSelector((s) => s.auth?.organization || s.auth?.org_name || "");
  const orgName   = reduxOrg
    || localStorage.getItem("organization")
    || localStorage.getItem("orgName")
    || "";

  const userEmail = localStorage.getItem("ownerEmail") || "";
  const initials  = orgName
    ? orgName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : userEmail.slice(0, 2).toUpperCase();

  const userRole = useSelector((s) => s.auth?.role || localStorage.getItem('userRole') || '');

  const navItems = isTechProvider(userEmail)
    ? [...baseNavItems, techProviderItem]
    : userRole.startsWith('client_')
      ? baseNavItems.filter(item => !['Templates', 'Campaign'].includes(item.label))
      : baseNavItems;

  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem("sidebar-collapsed");
      return saved !== null ? JSON.parse(saved) : false;
    } catch { return false; }
  });

  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed));
    onToggle?.(isCollapsed);
  }, [isCollapsed]);

  const handleToggle  = () => setIsCollapsed((p) => !p);
  const handleLogout  = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/signin", { replace: true });
  };

  /* shared style helper for bottom action rows */
  const rowStyle = (extra = {}) => ({
    padding:         isCollapsed ? "10px 0" : "10px 12px",
    justifyContent:  isCollapsed ? "center" : "flex-start",
    gap:             isCollapsed ? 0 : "10px",
    ...extra,
  });

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 256 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex-shrink-0 flex flex-col h-screen overflow-hidden bg-surface border-r border-gray-200 shadow-sm"
    >
      {/* ── Logo ── */}
      <div className="relative z-10 flex items-center h-16 px-4 flex-shrink-0 border-b border-gray-200">
        <div className="flex items-center gap-3 overflow-hidden min-w-0 w-full">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="flex items-center gap-3 min-w-0"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src={jmsLogo} alt="JMS TechNova" className="w-7 h-7 object-contain" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-bold leading-tight whitespace-nowrap tracking-wide text-text-primary">
                    JMS TechNova
                  </span>
                  <span className="text-[10px] font-medium tracking-widest uppercase text-text-secondary opacity-50">
                    CRM Suite
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-10 flex-1 px-2.5 py-4 overflow-y-auto overflow-x-hidden">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="px-3 mb-2 text-[10px] font-semibold tracking-[0.12em] uppercase text-text-secondary opacity-50"
            >
              Menu
            </motion.p>
          )}
        </AnimatePresence>

        <ul className="space-y-0.5">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={item.label} className="relative">
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="relative flex items-center rounded-xl transition-all duration-200 cursor-pointer"
                  style={({ isActive }) => ({
                    padding:        isCollapsed ? "10px 0" : "10px 12px",
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    gap:            isCollapsed ? 0 : "10px",
                    background: isActive
                      ? "rgba(var(--color-primary-rgb, 99 102 241) / 0.12)"
                      : hoveredItem === item.label
                      ? "rgba(0,0,0,0.04)"
                      : "transparent",
                  })}
                  title={isCollapsed ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="activeAccent"
                          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-primary"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}

                      <div
                        className={`flex-shrink-0 flex items-center justify-center w-5 h-5 transition-colors duration-200 ${
                          isActive ? "text-primary"
                          : hoveredItem === item.label ? "text-text-primary"
                          : "text-text-secondary"
                        }`}
                        style={isCollapsed ? { width: "100%", justifyContent: "center" } : {}}
                      >
                        <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                      </div>

                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.18, delay: index * 0.02 }}
                            className={`text-sm whitespace-nowrap transition-colors duration-200 ${
                              isActive ? "font-semibold text-primary"
                              : hoveredItem === item.label ? "font-medium text-text-primary"
                              : "font-medium text-text-secondary"
                            }`}
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {isCollapsed && hoveredItem === item.label && (
                        <motion.div
                          initial={{ opacity: 0, x: -4, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-full ml-3 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none z-[100] shadow-lg"
                          style={{ background: "#1f2937", color: "#f9fafb", border: "1px solid rgba(0,0,0,0.1)" }}
                        >
                          {item.label}
                          <span
                            className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
                            style={{ borderRightColor: "#1f2937" }}
                          />
                        </motion.div>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Bottom section ── */}
      <div className="relative z-10 flex-shrink-0 border-t border-gray-200">
        <div className="px-2.5 py-3 space-y-1">

          {/* Organisation row — same style as nav items */}
          <div
            className="flex items-center rounded-xl bg-gray-50 border border-gray-100 overflow-hidden"
            style={rowStyle()}
          >
            {/* Avatar */}
            <div
              className="flex-shrink-0 w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center shadow-sm"
              style={isCollapsed ? { marginLeft: "auto", marginRight: "auto" } : {}}
            >
              <span className="text-white text-[11px] font-bold leading-none tracking-wide">
                {initials || "??"}
              </span>
            </div>

            {/* Name + label */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.18 }}
                  className="min-w-0 flex-1"
                >
                  <p className="text-[13px] font-semibold text-text-primary truncate leading-tight">
                    {orgName || "Organisation"}
                  </p>
                  <p className="text-[10px] text-text-secondary opacity-55 leading-tight mt-0.5">
                    Organisation
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logout */}
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center rounded-xl transition-all duration-200 hover:bg-red-50 text-red-500 cursor-pointer"
            style={rowStyle()}
          >
            <div className="flex-shrink-0">
              <LogOut size={18} strokeWidth={2} />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.18 }}
                  className="text-sm font-semibold whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Collapse toggle */}
          <motion.button
            onClick={handleToggle}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center rounded-xl transition-all duration-200 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-text-secondary cursor-pointer"
            style={rowStyle({ padding: isCollapsed ? "9px 0" : "9px 12px" })}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <div className="flex-shrink-0 opacity-60">
              {isCollapsed
                ? <PanelLeftOpen  size={17} strokeWidth={1.8} />
                : <PanelLeftClose size={17} strokeWidth={1.8} />
              }
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.18 }}
                  className="text-xs font-medium whitespace-nowrap opacity-60"
                >
                  Collapse sidebar
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;