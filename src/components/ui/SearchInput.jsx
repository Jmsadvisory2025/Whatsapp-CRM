import React from "react";
import { RiUserSearchLine } from "react-icons/ri";

const SearchInput = ({ placeholder = "Search...", onChange, value, className = "" }) => {
  return (
    <div className={`relative w-full ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      />
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
    <RiUserSearchLine size={20} />
      </span>
    </div>
  );
};

export default SearchInput;