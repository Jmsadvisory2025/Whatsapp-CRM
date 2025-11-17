import React, { useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";

const LocationsSort = ({ selectedLocation, onLocationChange, className = "" }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Define the locations with translations
  const locations = [
    {
      id: "all",
      name: "All Locations"
    },
    {
      id: "ahmedabad-nikol",
      name: "Ahmedabad - Nikol",
      translations: {
        english: "Ahmedabad - Nikol",
        gujarati: "અમદાવાદ - નિકોલ",
        hindi: "अहमदाबाद - निकोल"
      }
    },
    {
      id: "ahmedabad-ambawadi",
      name: "Ahmedabad - Ambawadi",
      translations: {
        english: "Ahmedabad - Ambawadi",
        gujarati: "અમદાવાદ - આંબાવાડી",
        hindi: "अहमदाबाद - आंबावाडी"
      }
    }
  ];

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Location pin icon decoration */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
        <MapPin className={`h-4 w-4 transition-colors duration-200 ${
          isFocused ? 'text-green-600' : 'text-gray-400'
        }`} />
      </div>
      
      {/* Select element */}
      <select
        value={selectedLocation}
        onChange={(e) => onLocationChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          appearance-none w-full
          bg-gradient-to-br from-white to-gray-50
          border-2 rounded-xl
          py-2.5 pl-10 pr-10
          text-sm font-medium text-gray-700
          cursor-pointer
          transition-all duration-300 ease-out
          shadow-sm hover:shadow-md
          ${isFocused 
            ? 'border-green-500 ring-4 ring-green-100 shadow-lg' 
            : 'border-gray-200 hover:border-green-300'
          }
          focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {locations.map((location, index) => (
          <option 
            key={location.id} 
            value={location.id}
                       className="py-2 px-4 text-gray-700 bg-white"

            style={{
              backgroundImage: location.id !== 'all' 
                ? 'linear-gradient(to right, transparent 0%, rgba(34, 197, 94, 0.05) 100%)'
                : undefined
            }}
          >
      {location.name}
          </option>
        ))}
      </select>
      
      {/* Animated chevron icon */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDown className={`h-5 w-5 transition-all duration-300 ${
          isFocused 
            ? 'text-green-600 rotate-180' 
            : 'text-gray-400'
        }`} />
      </div>
      
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/20 pointer-events-none" />
    </div>
  );
};

export default LocationsSort;