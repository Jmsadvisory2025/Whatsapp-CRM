import React from "react";
import { ChevronDown } from "lucide-react";

const DiseasesSort = ({ selectedDisease, onDiseaseChange, className = "" }) => {
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
      <select
        value={selectedDisease}
        onChange={(e) => onDiseaseChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full cursor-pointer shadow-sm"
      >
        {diseases.map((disease) => (
          <option key={disease.id} value={disease.id}>
            {disease.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </div>
    </div>
  );
};

export default DiseasesSort;