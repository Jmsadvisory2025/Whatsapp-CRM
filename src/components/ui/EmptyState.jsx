import React from "react";

const EmptyState = ({ title, description, icon: Icon }) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm text-center flex flex-col items-center">
      {/* Optional Icon */}
      {Icon && <Icon className="w-10 h-10 text-gray-400 mb-3" />}

      {/* Title */}
      <p className="text-gray-700 font-semibold text-lg">{title}</p>

      {/* Description */}
      {description && (
        <p className="text-gray-500 text-sm mt-1 max-w-md">{description}</p>
      )}
    </div>
  );
};

export default EmptyState;
