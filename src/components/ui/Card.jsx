import React from "react";
import { motion } from "framer-motion";

const Card = ({ children, className = "" , onClick  }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-surface p-6 rounded-xl border border-gray-200/80 shadow-sm ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default Card;