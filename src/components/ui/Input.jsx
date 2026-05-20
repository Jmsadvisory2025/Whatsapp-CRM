import React, { useState } from "react";

const Input = ({
  type = "text",
  name,
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  className = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    type === "password" && showPassword
      ? "text"
      : type;

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Input field */}
      <div className="relative">
        <input
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 outline-none transition duration-200
            ${
              error
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-primary-light focus:border-primary-light"
            }
            ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
            ${className}
          `}
        />

        {/* Password toggle button */}
        {type === "password" && (
          <button
            type="button"
            onClick={() =>
              setShowPassword((prev) => !prev)
            }
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 text-sm"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {/* Error text */}
      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;