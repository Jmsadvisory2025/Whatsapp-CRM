import React from "react";

// default role styles (can be overridden by props)
const defaultRoleStyles = {
  Admin: {
    filled: { bg: "bg-yellow-100", text: "text-yellow-800", border: "" },
    outline: {
      bg: "bg-transparent",
      text: "text-yellow-700",
      border: "border border-yellow-900",
    },
  },
  Manager: {
    filled: { bg: "bg-blue-100", text: "text-blue-600", border: "" },
    outline: {
      bg: "bg-transparent",
      text: "text-blue-600",
      border: "border border-blue-500",
    },
  },
  "Sales Person": {
    filled: { bg: "bg-green-100", text: "text-green-700", border: "" },
    outline: {
      bg: "bg-transparent",
      text: "text-green-700",
      border: "border border-green-500",
    },
  },
};

const defaultFallback = {
  filled: { bg: "bg-gray-100", text: "text-gray-600", border: "" },
  outline: {
    bg: "bg-transparent",
    text: "text-gray-600",
    border: "border border-gray-400",
  },
};

const RoleBadge = ({
  role,
  variant = "filled",
  roleStyles = defaultRoleStyles, // ✅ allow custom styles
  fallback = defaultFallback,
}) => {
  const styles = roleStyles[role]?.[variant] || fallback[variant];

  return (
    <span
      className={`px-4 py-1 rounded-full text-sm font-medium ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {role}
    </span>
  );
};

export default RoleBadge;
