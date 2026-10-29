import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
  ChevronDown,
  History,
  PlusCircle,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { FaMeta } from "react-icons/fa6";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import jmsLogo from "../../assets/jms.png";
import { isTechProvider, canViewClients } from "../../store/authUtils";

const baseMainMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", color: "#165DFF" },
  { icon: TrendingUp, label: "Customers", path: "/leads-prospects", color: "#0EA5E9" },
  { icon: FaWhatsapp, label: "Inbox", path: "/whatsapp", color: "#25D366" },
  { icon: FileText, label: "Message Templates", path: "/templates", color: "#F59E0B" },
  {
    icon: Megaphone,
    label: "Campaigns",
    path: "/campaign",
    color: "#8B5CF6",
    subItems: [
      { label: "Create Campaign", path: "/campaign?tab=new", tabKey: "new", icon: PlusCircle },
      { label: "Campaign History", path: "/campaign?tab=history", tabKey: "history", icon: History },
    ],
  },
];

const baseManagementItems = [
  { icon: FaMeta, label: "Meta Documents", path: "/meta-registration", color: "#0668E1" },
  { icon: Users2, label: "Profile", path: "/team", color: "#6366F1" },
];

const techProviderItem = { icon: Building2, label: "Clients", path: "/clients", color: "#10B981" };

const Sidebar = ({ onToggle = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const isOnCampaign = location.pathname.startsWith("/campaign");
  const currentTabParam = new URLSearchParams(location.search).get("tab") || "new";
  const [campaignMenuOpen, setCampaignMenuOpen] = useState(isOnCampaign);

  useEffect(() => {
    if (isOnCampaign) {
      setCampaignMenuOpen(true);
    }
  }, [isOnCampaign]);

  const reduxOrg = useSelector((s) => s.auth?.organization || s.auth?.org_name || "");
  const orgName = reduxOrg
    || localStorage.getItem("organization")
    || localStorage.getItem("orgName")
    || "";

  const userEmail = localStorage.getItem("ownerEmail") || "";
  const initials = orgName
    ? orgName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : userEmail.slice(0, 2).toUpperCase();

  const userRole = useSelector((s) => s.auth?.role || localStorage.getItem('userRole') || '');
  const wabaConnected = useSelector((s) => s.auth?.waba_connected) ?? (localStorage.getItem('wabaConnected') === 'true');

  // Filter Main Menu
  let mainMenuItems = baseMainMenuItems;
  if (userRole.startsWith('client_')) {
    mainMenuItems = mainMenuItems.filter(item => !['Message Templates', 'Campaigns'].includes(item.label));
  }

  // Filter Management Menu
  let managementItems = baseManagementItems;
  if (wabaConnected) {
    managementItems = managementItems.filter(item => item.label !== 'Meta Documents');
  }
  if (isTechProvider(userEmail) && canViewClients(userEmail)) {
    managementItems = [techProviderItem, ...managementItems];
  }

  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem("sidebar-collapsed");
      return saved !== null ? JSON.parse(saved) : false;
    } catch { return false; }
  });

  const [hoveredItem, setHoveredItem] = useState(null);

  const [featureClicks, setFeatureClicks] = useState(() => {
    return parseInt(localStorage.getItem('template_feature_clicks') || '0', 10);
  });

  const isFeatureNew = (releaseDateString, daysToKeep = 7) => {
    const releaseDate = new Date(releaseDateString);
    const expiryDate = new Date(releaseDate);
    expiryDate.setDate(expiryDate.getDate() + daysToKeep);
    return new Date() < expiryDate;
  };

  const showTemplatesNewBadge = isFeatureNew("2026-10-09") && featureClicks < 4;

  const handleNavClick = (label) => {
    if (label === 'Message Templates') {
      const current = parseInt(localStorage.getItem('template_feature_clicks') || '0', 10);
      if (current < 4) {
        localStorage.setItem('template_feature_clicks', (current + 1).toString());
        setFeatureClicks(current + 1);
      }
    }
  };

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed));
    onToggle?.(isCollapsed);
  }, [isCollapsed]);

  const handleToggle = () => setIsCollapsed((p) => !p);
  
  const handleLogout = () => {
    dispatch(logout());
    sessionStorage.clear();
    navigate("/signin", { replace: true });
  };

  const renderNavList = (items) => (
    <ul className="space-y-1">
      {items.map((item, index) => {
        const Icon = item.icon;
        const hasSubItems = Array.isArray(item.subItems) && item.subItems.length > 0;

        if (hasSubItems) {
          return (
            <li key={item.label} className="relative">
              <div
                onClick={() => {
                  if (isCollapsed) {
                    navigate(item.path);
                  } else {
                    setCampaignMenuOpen((prev) => !prev);
                    if (!isOnCampaign) {
                      navigate(item.path);
                    }
                  }
                }}
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  relative flex items-center justify-between rounded-xl transition-all duration-150 cursor-pointer
                  ${
                    isOnCampaign
                      ? "bg-white text-[#172033] font-semibold shadow-sm border border-slate-200/90"
                      : hoveredItem === item.label
                        ? "bg-slate-100/70 text-[#172033]"
                        : "text-[#64748B] hover:text-[#172033]"
                  }
                `}
                style={{
                  padding: isCollapsed ? "10px 0" : "9px 12px",
                  justifyContent: isCollapsed ? "center" : "space-between",
                }}
                title={isCollapsed ? item.label : undefined}
              >
                <div
                  className="flex items-center"
                  style={{
                    gap: isCollapsed ? 0 : "12px",
                    ...(isCollapsed ? { width: "100%", justifyContent: "center" } : {}),
                  }}
                >
                  <div
                    className="flex-shrink-0 flex items-center justify-center w-5 h-5 transition-transform duration-150"
                    style={{
                      color: item.color || "#165DFF",
                    }}
                  >
                    <Icon size={18} strokeWidth={isOnCampaign ? 2.3 : 1.9} />
                  </div>

                  {!isCollapsed && (
                    <span
                      className={`text-[13px] whitespace-nowrap tracking-normal font-medium ${
                        isOnCampaign ? "text-[#172033] font-semibold" : "text-[#64748B]"
                      }`}
                    >
                      {item.label}
                    </span>
                  )}
                </div>

                {!isCollapsed && (
                  <ChevronDown
                    size={14}
                    className={`text-[#94A3B8] transition-transform duration-200 ${
                      campaignMenuOpen ? "rotate-180 text-[#172033]" : ""
                    }`}
                  />
                )}

                {/* Tooltip for collapsed mode */}
                {isCollapsed && hoveredItem === item.label && (
                  <motion.div
                    initial={{ opacity: 0, x: -4, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-full ml-3 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none z-[100] shadow-lg bg-[#172033] text-white"
                  >
                    {item.label}
                    <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#172033]" />
                  </motion.div>
                )}
              </div>

              {/* Sub-menu items */}
              <AnimatePresence initial={false}>
                {!isCollapsed && campaignMenuOpen && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mt-1 ml-5 pl-3 border-l border-slate-200 space-y-1"
                  >
                    {item.subItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive =
                        isOnCampaign && currentTabParam === sub.tabKey;

                      return (
                        <li key={sub.label}>
                          <button
                            type="button"
                            onClick={() => navigate(sub.path)}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                              isSubActive
                                ? "bg-blue-50/80 text-[#165DFF] font-semibold"
                                : "text-[#64748B] hover:text-[#172033] hover:bg-slate-50 font-medium"
                            }`}
                          >
                            {SubIcon && (
                              <SubIcon
                                size={14}
                                className={
                                  isSubActive ? "text-[#165DFF]" : "text-[#94A3B8]"
                                }
                              />
                            )}
                            <span className="truncate">{sub.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          );
        }

        return (
          <li key={item.label} className="relative">
            <NavLink
              to={item.path}
              end={item.path === "/"}
              onClick={() => handleNavClick(item.label)}
              onMouseEnter={() => setHoveredItem(item.label)}
              onMouseLeave={() => setHoveredItem(null)}
              className={({ isActive }) => `
                relative flex items-center rounded-xl transition-all duration-150 cursor-pointer
                ${
                  isActive
                    ? "bg-white text-[#172033] font-semibold shadow-sm border border-slate-200/90"
                    : hoveredItem === item.label
                      ? "bg-slate-100/70 text-[#172033]"
                      : "text-[#64748B] hover:text-[#172033]"
                }
              `}
              style={{
                padding: isCollapsed ? "10px 0" : "9px 12px",
                justifyContent: isCollapsed ? "center" : "flex-start",
                gap: isCollapsed ? 0 : "12px",
              }}
              title={isCollapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <div
                    className="flex-shrink-0 flex items-center justify-center w-5 h-5 transition-transform duration-150"
                    style={{
                      color: item.color || "#165DFF",
                      ...(isCollapsed ? { width: "100%", justifyContent: "center" } : {})
                    }}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.3 : 1.9} />
                  </div>

                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.18, delay: index * 0.02 }}
                        className={`text-[13px] whitespace-nowrap tracking-normal font-medium ${
                          isActive ? "text-[#172033] font-semibold" : "text-[#64748B]"
                        }`}
                      >
                        {item.label}
                        {item.label === 'Message Templates' && showTemplatesNewBadge && (
                          <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-white bg-[#165DFF] rounded-full shadow-xs">
                            NEW
                          </span>
                        )}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Tooltip for collapsed mode */}
                  {isCollapsed && hoveredItem === item.label && (
                    <motion.div
                      initial={{ opacity: 0, x: -4, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-full ml-3 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none z-[100] shadow-lg bg-[#172033] text-white"
                    >
                      {item.label}
                      <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#172033]" />
                    </motion.div>
                  )}
                </>
              )}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 76 : 230 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex-shrink-0 flex flex-col h-screen overflow-hidden bg-white text-[#172033] border-r border-[#E5E7EB] shadow-xs z-20 font-sans"
    >
      {/* ── Brand Logo Header ── */}
      <div className="relative z-10 flex items-center justify-center h-16 px-4 flex-shrink-0 border-b border-[#E5E7EB]/80">
        <div 
          className="flex items-center justify-center w-full cursor-pointer" 
          onClick={() => navigate("/")}
        >
          <img
            src={jmsLogo}
            alt="JMS Logo"
            className="h-11 sm:h-12 w-auto object-contain"
          />
        </div>
      </div>

      {/* ── Nav Links Container ── */}
      <nav className="relative z-10 flex-1 px-3 py-2.5 overflow-y-auto overflow-x-hidden space-y-2.5">
        
        {/* SECTION 1: MAIN NAVIGATION */}
        <div>
          {renderNavList(mainMenuItems)}
        </div>

        {/* SECTION 2: MANAGEMENT & SETTINGS */}
        {managementItems.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            {renderNavList(managementItems)}
          </div>
        )}
      </nav>

      {/* ── Bottom User Profile Section ── */}
      <div className="relative z-10 flex-shrink-0 border-t border-[#E5E7EB] p-2.5">
        {!isCollapsed ? (
          /* Expanded state: avatar + name/email + logout button */
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 text-xs font-semibold text-[#165DFF]">
                {initials || "AD"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#172033] truncate leading-tight">
                  {orgName || "Admin"}
                </p>
                <p className="text-[10px] text-[#64748B] truncate leading-tight mt-0.5">
                  {userEmail || "admin@jms.com"}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#EF4444] hover:bg-red-50 transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut size={16} strokeWidth={2} />
            </button>
          </div>
        ) : (
          /* Collapsed state: vertically stacked avatar and logout button, completely separated */
          <div className="flex flex-col items-center gap-2 py-1">
            <div 
              className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-xs font-semibold text-[#165DFF] cursor-default"
              title={`${orgName || "Admin"} (${userEmail || "admin@jms.com"})`}
            >
              {initials || "AD"}
            </div>

            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#EF4444] hover:bg-red-50 transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut size={16} strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Collapse Drawer Button */}
        <div className={`mt-1 pt-1 border-t border-slate-100 flex ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
          <button
            onClick={handleToggle}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;