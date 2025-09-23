import React from "react";
import "./ProfessionalMedicalLoader.css"; // import the css file

const ProfessionalMedicalLoader = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-8">
      <div className="relative">
        {/* Main scene container */}
        <div className="w-96 h-80 relative">
          {/* ECG background */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 400 300">
              <path
                d="M0,150 L50,150 L60,100 L70,200 L80,50 L90,250 L100,150 L400,150"
                stroke="#3b82f6"
                strokeWidth="2"
                fill="none"
                className="animate-pulse"
              />
            </svg>
          </div>

          {/* Floating medical equipment */}
          <div className="absolute top-8 left-8">
            <div className="relative" style={{ animation: "float-gentle 4s ease-in-out infinite" }}>
              {/* Stethoscope */}
              <div className="w-8 h-8 relative">
                <div className="w-6 h-6 border-4 border-gray-600 rounded-full bg-gray-100"></div>
                <div className="absolute top-2 -right-1 w-4 h-1 bg-gray-600 rounded-full transform rotate-45"></div>
                <div className="absolute top-4 right-1 w-4 h-1 bg-gray-600 rounded-full transform rotate-45"></div>
              </div>
            </div>
          </div>

          <div className="absolute top-4 right-16">
            <div
              className="relative"
              style={{ animation: "float-gentle 4s ease-in-out infinite 1s" }}
            >
              {/* Medical chart */}
              <div className="w-6 h-8 bg-white border-2 border-gray-300 rounded shadow-sm">
                <div className="h-1 bg-blue-400 mx-1 mt-1 rounded"></div>
                <div className="h-1 bg-green-400 mx-1 mt-1 rounded"></div>
                <div className="h-1 bg-red-400 mx-1 mt-1 rounded"></div>
              </div>
            </div>
          </div>

          <div className="absolute top-12 right-8">
            <div
              className="relative"
              style={{ animation: "float-gentle 4s ease-in-out infinite 0.5s" }}
            >
              {/* Pills */}
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gradient-to-b from-red-400 to-red-600 rounded-full shadow-sm"></div>
                <div className="w-3 h-3 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full shadow-sm"></div>
                <div className="w-3 h-3 bg-gradient-to-b from-green-400 to-green-600 rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>

          {/* Patient */}
          <div className="absolute bottom-8 left-12">
            <div className="relative">
              {/* Patient head */}
              <div className="w-16 h-16 bg-gradient-to-b from-yellow-200 to-yellow-300 rounded-full border-2 border-yellow-400 shadow-lg relative mb-2">
                {/* Hair */}
                <div className="absolute -top-2 left-2 right-2 h-4 bg-gradient-to-b from-amber-900 to-amber-800 rounded-t-full"></div>
                {/* Eyes */}
                <div
                  className="absolute top-4 left-3 w-2 h-2 bg-black rounded-full"
                  style={{ animation: "blink 3s ease-in-out infinite" }}
                ></div>
                <div
                  className="absolute top-4 right-3 w-2 h-2 bg-black rounded-full"
                  style={{ animation: "blink 3s ease-in-out infinite" }}
                ></div>
                {/* Nervous smile */}
                <div
                  className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-2 border-b-2 border-gray-700 rounded-full"
                  style={{ animation: "nervous-smile 2s ease-in-out infinite" }}
                ></div>
                {/* Sweat drop */}
                <div
                  className="absolute top-2 right-1 w-1 h-2 bg-blue-300 rounded-full opacity-70"
                  style={{ animation: "sweat-drop 2s ease-in-out infinite" }}
                ></div>
              </div>

              {/* Patient body */}
              <div className="w-20 h-24 bg-gradient-to-b from-sky-200 to-sky-400 rounded-t-2xl border-2 border-sky-500 shadow-lg relative">
                <div className="absolute top-2 left-2 right-2 h-1 bg-sky-600 opacity-30 rounded"></div>
                <div className="absolute top-4 left-2 right-2 h-1 bg-sky-600 opacity-30 rounded"></div>

                {/* Arm */}
                <div
                  className="absolute -right-10 top-6 w-16 h-4 bg-gradient-to-r from-yellow-200 to-yellow-300 border border-yellow-400 rounded-full origin-left shadow-md"
                  style={{ animation: "patient-arm-shake 1.5s ease-in-out infinite" }}
                >
                  <div className="absolute -right-3 -top-1 w-6 h-6 bg-gradient-to-b from-yellow-200 to-yellow-300 border border-yellow-400 rounded-full shadow-sm"></div>
                  <div className="absolute left-0 -top-1 w-4 h-6 bg-gradient-to-b from-sky-200 to-sky-400 border border-sky-500 rounded-l-full"></div>
                </div>
              </div>

              {/* Legs */}
              <div className="flex space-x-1 mt-1">
                <div className="w-8 h-16 bg-gradient-to-b from-blue-600 to-blue-800 rounded-b-2xl border border-blue-700 shadow-md"></div>
                <div className="w-8 h-16 bg-gradient-to-b from-blue-600 to-blue-800 rounded-b-2xl border border-blue-700 shadow-md"></div>
              </div>
            </div>
          </div>

          {/* Doctor */}
          <div className="absolute bottom-8 right-12">
            <div className="relative">
              {/* Doctor head */}
              <div className="w-16 h-16 bg-gradient-to-b from-pink-200 to-pink-300 rounded-full border-2 border-pink-400 shadow-lg relative mb-2">
                <div className="absolute -top-2 left-2 right-2 h-4 bg-gradient-to-b from-gray-700 to-gray-800 rounded-t-full"></div>
                <div className="absolute top-3 left-1 right-1 h-4 border-2 border-gray-800 rounded bg-white bg-opacity-20"></div>
                <div className="absolute top-4 left-2 w-1.5 h-1.5 bg-black rounded-full"></div>
                <div className="absolute top-4 right-2 w-1.5 h-1.5 bg-black rounded-full"></div>
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-2 border-t-2 border-gray-700 rounded-full"></div>
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-12 h-4 bg-white border border-gray-300 rounded-t-2xl shadow-sm">
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-red-500 text-xs font-bold">
                    ✚
                  </div>
                </div>
              </div>

              {/* Coat */}
              <div className="w-20 h-24 bg-gradient-to-b from-white to-gray-50 rounded-t-2xl border-2 border-gray-200 shadow-lg relative">
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-2 border-4 border-gray-600 rounded-full bg-gray-100"></div>
                <div className="absolute top-3 left-2 w-3 h-3 bg-gray-700 rounded-full shadow-sm"></div>
                <div className="absolute top-3 right-2 w-3 h-3 bg-gray-700 rounded-full shadow-sm"></div>

                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="absolute top-14 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>

                <div className="absolute top-6 right-2 w-6 h-4 bg-blue-100 border border-blue-300 rounded text-xs flex items-center justify-center">
                  <span className="text-blue-800 font-bold text-xs">Dr</span>
                </div>

                {/* Arm with syringe */}
                <div
                  className="absolute -left-12 top-8 w-16 h-4 bg-gradient-to-r from-pink-200 to-pink-300 border border-pink-400 rounded-full origin-right shadow-md"
                  style={{ animation: "doctor-inject-smooth 2.5s ease-in-out infinite" }}
                >
                  <div className="absolute -left-10 top-1/2 transform -translate-y-1/2">
                    <div className="relative w-8 h-3 bg-gradient-to-r from-gray-200 to-gray-300 border border-gray-400 rounded-l-lg shadow-sm">
                      <div className="absolute top-0 left-1 w-px h-full bg-gray-500 opacity-50"></div>
                      <div className="absolute top-0 left-2 w-px h-full bg-gray-500 opacity-50"></div>
                      <div className="absolute top-0 left-3 w-px h-full bg-gray-500 opacity-50"></div>
                      <div
                        className="absolute top-1 left-1 right-2 bottom-1 bg-gradient-to-r from-blue-400 to-green-400 rounded opacity-70"
                        style={{ animation: "medicine-flow 2.5s ease-in-out infinite" }}
                      ></div>
                    </div>

                    <div
                      className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-4 h-0.5 bg-gradient-to-r from-gray-500 to-gray-700 shadow-sm"
                      style={{ animation: "needle-shine 1s ease-in-out infinite" }}
                    >
                      <div className="absolute top-0 left-2 w-px h-full bg-white opacity-60"></div>
                    </div>

                    <div
                      className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gradient-to-b from-red-400 to-red-600 rounded-full shadow-sm"
                      style={{ animation: "plunger-action 2.5s ease-in-out infinite" }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Legs */}
              <div className="flex space-x-1 mt-1">
                <div className="w-8 h-16 bg-gradient-to-b from-gray-700 to-gray-900 rounded-b-2xl border border-gray-600 shadow-md"></div>
                <div className="w-8 h-16 bg-gradient-to-b from-gray-700 to-gray-900 rounded-b-2xl border border-gray-600 shadow-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading text */}
      <div className="mt-4 text-sm text-gray-500 font-medium">
        {text || "Please wait while we prepare everything for you"}
      </div>
    </div>
  );
};

// Demo wrapper
const LoaderDemo = () => {
  return (
    <div>
      <ProfessionalMedicalLoader text="Loading your medical dashboard..." />
    </div>
  );
};

export default LoaderDemo;
