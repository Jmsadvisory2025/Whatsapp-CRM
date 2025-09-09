import React from "react";
import { NavLink } from "react-router-dom";
import AllIcons from "../../assets/images/assets";

const {
  DashboardIcon,
  LeadsIcon,
  cardProspectsIcon,
  PatientsIcon,
  RemindersIcon,
  TeamIcon,
  WhatsappIcon,
} = AllIcons;

const navItems = [
  { icon: DashboardIcon, label: "Dashboard", path: "/" },
  { icon: cardProspectsIcon, label: "Prospect", path: "/prospects" },
  { icon: LeadsIcon, label: "Leads", path: "/leads" },
  { icon: PatientsIcon, label: "Patient", path: "/patients" },
  { icon: RemindersIcon, label: "Reminders", path: "/reminders" },
  { icon: TeamIcon, label: "Team", path: "/team" },
  { icon: WhatsappIcon, label: "Whatsapp", path: "/whatsapp" },
];

const Sidebar = () => {
  return (
    <aside className="w-64 flex-shrink-0 bg-surface border-r flex flex-col">
      <div className="h-16 flex items-center px-7 border-b">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 7L12 12L22 7"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 22V12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-text-primary">LeadFlow</span>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 my-1 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-primary/15 text-primary font-semibold"
                      : "text-text-secondary hover:bg-gray-100"
                  }`
                }
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className="w-6 h-8 object-contain"
                />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
