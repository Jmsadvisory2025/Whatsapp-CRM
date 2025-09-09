import React from "react";
import { motion } from "framer-motion";

const Button = ({ children, onClick, className = "", variant = "primary" }) => {
  const baseClasses =
    " flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg  transition-all duration-200";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-light focus:ring-primary",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};

export default Button;
