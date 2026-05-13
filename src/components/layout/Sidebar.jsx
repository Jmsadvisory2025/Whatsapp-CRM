import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Bell,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Users2,
} from "lucide-react";
import { RiUserSearchFill } from "react-icons/ri";
import { FaWhatsapp } from "react-icons/fa";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: RiUserSearchFill, label: "Prospect", path: "/prospects" },
  { icon: TrendingUp, label: "Leads", path: "/leads" },
  { icon: Users, label: "Patient", path: "/patients" },
  { icon: Bell, label: "Reminders", path: "/reminders" },
  { icon: Users2, label: "Team", path: "/team" },
  { icon: FaWhatsapp, label: "Whatsapp", path: "/whatsapp" },
];

const Sidebar = ({ onToggle = () => {} }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem("sidebar-collapsed");
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed));
    onToggle?.(isCollapsed);
  }, [isCollapsed]);

  const handleToggle = () => setIsCollapsed((prev) => !prev);

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 256 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex-shrink-0 flex flex-col h-screen overflow-hidden bg-surface border-r border-gray-200 shadow-sm"
    >
      {/* Logo Section */}
      <div className="relative z-10 flex items-center h-16 px-4 flex-shrink-0 border-b border-gray-200">
        <div className="flex items-center gap-3 overflow-hidden min-w-0 w-full">
          {/* Logo mark */}
          <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-primary shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M2 7L12 12L22 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 22V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="flex flex-col min-w-0"
              >
                <span className="text-base font-bold leading-tight whitespace-nowrap tracking-wide text-text-primary">
                  LeadFlow
                </span>
                <span className="text-[10px] font-medium tracking-widest uppercase text-text-secondary opacity-50">
                  CRM Suite
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="relative z-10 flex-1 px-2.5 py-4 overflow-y-auto overflow-x-hidden">
        {/* Section label */}
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
                  end
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="relative flex items-center rounded-xl transition-all duration-200 cursor-pointer"
                  style={({ isActive }) => ({
                    padding: isCollapsed ? "10px 0" : "10px 12px",
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    gap: isCollapsed ? 0 : "10px",
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
                      {/* Active left accent bar */}
                      {isActive && (
                        <motion.div
                          layoutId="activeAccent"
                          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-primary"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}

                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 flex items-center justify-center w-5 h-5 transition-colors duration-200 ${
                          isActive
                            ? "text-primary"
                            : hoveredItem === item.label
                            ? "text-text-primary"
                            : "text-text-secondary"
                        }`}
                        style={isCollapsed ? { width: "100%", justifyContent: "center" } : {}}
                      >
                        <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                      </div>

                      {/* Label */}
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.18, delay: index * 0.02 }}
                            className={`text-sm whitespace-nowrap transition-colors duration-200 ${
                              isActive
                                ? "font-semibold text-primary"
                                : hoveredItem === item.label
                                ? "font-medium text-text-primary"
                                : "font-medium text-text-secondary"
                            }`}
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Tooltip when collapsed */}
                      {isCollapsed && hoveredItem === item.label && (
                        <motion.div
                          initial={{ opacity: 0, x: -4, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-full ml-3 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none z-[100] shadow-lg"
                          style={{
                            background: "#1f2937",
                            color: "#f9fafb",
                            border: "1px solid rgba(0,0,0,0.1)",
                          }}
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

      {/* Bottom: User info + Collapse button */}
      <div className="relative z-10 flex-shrink-0 border-t border-gray-200">

        {/* User pill — expanded state */}
        {/* <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="mx-2.5 mt-3 mb-2 flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 bg-primary text-white">
                A
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold truncate text-text-primary">
                  Admin User
                </span>
                <span className="text-[10px] truncate text-text-secondary opacity-60">
                  admin@leadflow.io
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence> */}

        {/* User avatar — collapsed state */}
       

        {/* Collapse toggle button */}
        <div className="p-4">
          <motion.button
            onClick={handleToggle}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center rounded-xl transition-all duration-200 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-text-secondary cursor-pointer"
            style={{
              padding: isCollapsed ? "9px 0" : "9px 12px",
              justifyContent: isCollapsed ? "center" : "flex-start",
              gap: isCollapsed ? 0 : "10px",
            }}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <div className="flex-shrink-0 opacity-60">
              {isCollapsed ? (
                <PanelLeftOpen size={17} strokeWidth={1.8} />
              ) : (
                <PanelLeftClose size={17} strokeWidth={1.8} />
              )}
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