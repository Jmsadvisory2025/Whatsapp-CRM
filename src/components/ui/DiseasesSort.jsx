import React, { useState } from "react";
import { ChevronDown, Stethoscope } from "lucide-react";

const DiseasesSort = ({ selectedDisease, onDiseaseChange, className = "" }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Define the diseases with translations
  const diseases = [
    {
      id: "all",
      name: "All Diseases",
      translations: {
        english: "All Diseases",
        gujarati: "બધા રોગો",
        hindi: "सभी रोग"
      }
    },
    {
      id: "ptosis",
      name: "Ptosis - Dropping Eye Lids",
      translations: {
        english: "Ptosis - Dropping Eye Lids",
        gujarati: "પ્ટોસિસ - ઢળેલી પાંપણ",
        hindi: "प्टोसिस - झुकी हुई पलक"
      }
    },
    {
      id: "squint",
      name: "Squint - Cross Eye",
      translations: {
        english: "Squint - Cross Eye",
        gujarati: "સ્ક્વિન્ટ - ત્રાસી આંખ",
        hindi: "भेंगापन/तिरछी आंख"
      }
    },
    {
      id: "artificial-eye",
      name: "Artificial Eye",
      translations: {
        english: "Artificial Eye",
        gujarati: "કૃત્રિમ આંખ",
        hindi: "कृत्रिम आँख"
      }
    },
    {
      id: "small-mass",
      name: "Small Mass / Lump near Eye",
      translations: {
        english: "Small Mass / Lump near Eye",
        gujarati: "આંખની આજુબાજુ ગાંઠ",
        hindi: "आँख की पलक में गठन"
      }
    }
  ];

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Medical icon decoration */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
        <Stethoscope className={`h-4 w-4 transition-colors duration-200 ${
          isFocused ? 'text-blue-600' : 'text-gray-400'
        }`} />
      </div>
      
      {/* Select element */}
      <select
        value={selectedDisease}
        onChange={(e) => onDiseaseChange(e.target.value)}
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
            ? 'border-blue-500 ring-4 ring-blue-100 shadow-lg' 
            : 'border-gray-200 hover:border-blue-300'
          }
          focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {diseases.map((disease) => (
          <option 
            key={disease.id} 
            value={disease.id}
            className="py-2 px-4 text-gray-700 bg-white"
          >
            {disease.name}
          </option>
        ))}
      </select>
      
      {/* Animated chevron icon */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDown className={`h-5 w-5 transition-all duration-300 ${
          isFocused 
            ? 'text-blue-600 rotate-180' 
            : 'text-gray-400'
        }`} />
      </div>
      
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/20 pointer-events-none" />
    </div>
  );
};

export default DiseasesSort;