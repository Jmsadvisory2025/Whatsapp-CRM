import React from 'react';

const ProfessionalMedicalLoader = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-8">
      <div className="relative">
        {/* Main scene container */}
        <div className="w-96 h-80 relative">
          
          {/* Medical background elements */}
          <div className="absolute inset-0 opacity-10">
            {/* ECG line background */}
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
            <div 
              className="relative"
              style={{ animation: 'float-gentle 4s ease-in-out infinite' }}
            >
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
              style={{ animation: 'float-gentle 4s ease-in-out infinite 1s' }}
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
              style={{ animation: 'float-gentle 4s ease-in-out infinite 0.5s' }}
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
                <div className="absolute -top-2 left-2 right-2 h-4 bg-gradient-to-b from-brown-600 to-brown-700 rounded-t-full"></div>
                {/* Eyes */}
                <div 
                  className="absolute top-4 left-3 w-2 h-2 bg-black rounded-full"
                  style={{ animation: 'blink 3s ease-in-out infinite' }}
                ></div>
                <div 
                  className="absolute top-4 right-3 w-2 h-2 bg-black rounded-full"
                  style={{ animation: 'blink 3s ease-in-out infinite' }}
                ></div>
                {/* Nervous smile */}
                <div 
                  className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-2 border-b-2 border-gray-700 rounded-full"
                  style={{ animation: 'nervous-smile 2s ease-in-out infinite' }}
                ></div>
                {/* Sweat drops */}
                <div 
                  className="absolute top-2 right-1 w-1 h-2 bg-blue-300 rounded-full opacity-70"
                  style={{ animation: 'sweat-drop 2s ease-in-out infinite' }}
                ></div>
              </div>
              
              {/* Patient body */}
              <div className="w-20 h-24 bg-gradient-to-b from-sky-200 to-sky-400 rounded-t-2xl border-2 border-sky-500 shadow-lg relative">
                {/* Patient shirt pattern */}
                <div className="absolute top-2 left-2 right-2 h-1 bg-sky-600 opacity-30 rounded"></div>
                <div className="absolute top-4 left-2 right-2 h-1 bg-sky-600 opacity-30 rounded"></div>
                
                {/* Extended arm */}
                <div 
                  className="absolute -right-10 top-6 w-16 h-4 bg-gradient-to-r from-yellow-200 to-yellow-300 border border-yellow-400 rounded-full origin-left shadow-md"
                  style={{ animation: 'patient-arm-shake 1.5s ease-in-out infinite' }}
                >
                  {/* Hand */}
                  <div className="absolute -right-3 -top-1 w-6 h-6 bg-gradient-to-b from-yellow-200 to-yellow-300 border border-yellow-400 rounded-full shadow-sm"></div>
                  {/* Sleeve */}
                  <div className="absolute left-0 -top-1 w-4 h-6 bg-gradient-to-b from-sky-200 to-sky-400 border border-sky-500 rounded-l-full"></div>
                </div>
              </div>
              
              {/* Patient legs */}
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
                {/* Hair */}
                <div className="absolute -top-2 left-2 right-2 h-4 bg-gradient-to-b from-gray-700 to-gray-800 rounded-t-full"></div>
                {/* Professional glasses */}
                <div className="absolute top-3 left-1 right-1 h-4 border-2 border-gray-800 rounded bg-white bg-opacity-20"></div>
                <div className="absolute top-4 left-2 w-1.5 h-1.5 bg-black rounded-full"></div>
                <div className="absolute top-4 right-2 w-1.5 h-1.5 bg-black rounded-full"></div>
                {/* Confident smile */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-2 border-t-2 border-gray-700 rounded-full"></div>
                {/* Doctor cap with cross */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-12 h-4 bg-white border border-gray-300 rounded-t-2xl shadow-sm">
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-red-500 text-xs font-bold">✚</div>
                </div>
              </div>
              
              {/* Doctor coat */}
              <div className="w-20 h-24 bg-gradient-to-b from-white to-gray-50 rounded-t-2xl border-2 border-gray-200 shadow-lg relative">
                {/* Stethoscope around neck */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-2 border-4 border-gray-600 rounded-full bg-gray-100"></div>
                <div className="absolute top-3 left-2 w-3 h-3 bg-gray-700 rounded-full shadow-sm"></div>
                <div className="absolute top-3 right-2 w-3 h-3 bg-gray-700 rounded-full shadow-sm"></div>
                
                {/* Coat buttons */}
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="absolute top-14 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
                
                {/* Name tag */}
                <div className="absolute top-6 right-2 w-6 h-4 bg-blue-100 border border-blue-300 rounded text-xs flex items-center justify-center">
                  <span className="text-blue-800 font-bold text-xs">Dr</span>
                </div>
                
                {/* Doctor arm with advanced syringe */}
                <div 
                  className="absolute -left-12 top-8 w-16 h-4 bg-gradient-to-r from-pink-200 to-pink-300 border border-pink-400 rounded-full origin-right shadow-md"
                  style={{ animation: 'doctor-inject-smooth 2.5s ease-in-out infinite' }}
                >
                  {/* Professional syringe */}
                  <div className="absolute -left-10 top-1/2 transform -translate-y-1/2">
                    {/* Syringe body with gradient */}
                    <div className="relative w-8 h-3 bg-gradient-to-r from-gray-200 to-gray-300 border border-gray-400 rounded-l-lg shadow-sm">
                      {/* Measurement marks */}
                      <div className="absolute top-0 left-1 w-px h-full bg-gray-500 opacity-50"></div>
                      <div className="absolute top-0 left-2 w-px h-full bg-gray-500 opacity-50"></div>
                      <div className="absolute top-0 left-3 w-px h-full bg-gray-500 opacity-50"></div>
                      {/* Medicine liquid */}
                      <div 
                        className="absolute top-1 left-1 right-2 bottom-1 bg-gradient-to-r from-blue-400 to-green-400 rounded opacity-70"
                        style={{ animation: 'medicine-flow 2.5s ease-in-out infinite' }}
                      ></div>
                    </div>
                    
                    {/* Needle with shine effect */}
                    <div 
                      className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-4 h-0.5 bg-gradient-to-r from-gray-500 to-gray-700 shadow-sm"
                      style={{ animation: 'needle-shine 1s ease-in-out infinite' }}
                    >
                      <div className="absolute top-0 left-2 w-px h-full bg-white opacity-60"></div>
                    </div>
                    
                    {/* Syringe plunger */}
                    <div 
                      className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gradient-to-b from-red-400 to-red-600 rounded-full shadow-sm"
                      style={{ animation: 'plunger-action 2.5s ease-in-out infinite' }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Doctor legs */}
              <div className="flex space-x-1 mt-1">
                <div className="w-8 h-16 bg-gradient-to-b from-gray-700 to-gray-900 rounded-b-2xl border border-gray-600 shadow-md"></div>
                <div className="w-8 h-16 bg-gradient-to-b from-gray-700 to-gray-900 rounded-b-2xl border border-gray-600 shadow-md"></div>
              </div>
            </div>
          </div>

          {/* Advanced speech bubble */}
          {/* <div 
            className="absolute top-20 right-28 bg-white border-2 border-gray-300 rounded-xl px-4 py-2 shadow-lg"
            style={{ animation: 'speech-appear 4s ease-in-out infinite' }}
          >
            <div className="text-sm font-medium text-gray-700 whitespace-nowrap">Just a little pinch! 😊</div>
            <div className="absolute -bottom-3 left-6 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-white"></div>
            <div className="absolute -bottom-4 left-6 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-gray-300"></div>
          </div> */}

          {/* Patient thought bubble */}
          {/* <div 
            className="absolute top-16 left-20 bg-blue-50 border-2 border-blue-200 rounded-xl px-3 py-1 shadow-md"
            style={{ animation: 'thought-bubble 3s ease-in-out infinite 1s' }}
          >
            <div className="text-xs text-blue-700">😰 Will it hurt?</div>
            <div className="absolute -bottom-2 left-4 w-2 h-2 bg-blue-50 border-b-2 border-r-2 border-blue-200 rounded-full"></div>
            <div className="absolute -bottom-4 left-3 w-1 h-1 bg-blue-50 border-b-2 border-r-2 border-blue-200 rounded-full"></div>
          </div> */}

          {/* Injection sparkle effect */}
          {/* <div 
            className="absolute bottom-24 left-28"
            style={{ animation: 'injection-magic 2.5s ease-in-out infinite 1.5s' }}
          >
            <div className="relative">
              <div className="text-yellow-400 text-lg animate-spin">✨</div>
              <div className="absolute top-1 left-1 text-yellow-300 text-xs">💫</div>
            </div>
          </div> */}

          {/* Medical cross floating */}
          {/* <div 
            className="absolute top-6 left-1/2 transform -translate-x-1/2"
            style={{ animation: 'cross-glow 3s ease-in-out infinite' }}
          >
            <div className="text-2xl text-red-500 opacity-100">✚</div>
          </div> */}

        </div>

        {/* Advanced CSS animations */}
        <style jsx>{`
          @keyframes doctor-inject-smooth {
            0%, 100% { transform: translateX(0px) rotate(0deg); }
            40% { transform: translateX(-12px) rotate(-8deg); }
            50% { transform: translateX(-15px) rotate(-10deg); }
            60% { transform: translateX(-12px) rotate(-8deg); }
          }
          
          @keyframes patient-arm-shake {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-1px) rotate(-1deg); }
            50% { transform: translateY(1px) rotate(0deg); }
            75% { transform: translateY(-0.5px) rotate(0.5deg); }
          }
          
          @keyframes needle-shine {
            0%, 100% { opacity: 0.8; transform: translateY(-50%) scaleX(1); }
            50% { opacity: 1; transform: translateY(-50%) scaleX(1.1); box-shadow: 0 0 4px rgba(255,255,255,0.8); }
          }
          
          @keyframes plunger-action {
            0%, 60%, 100% { transform: translateX(0px) translateY(-50%); }
            70%, 90% { transform: translateX(3px) translateY(-50%); }
          }
          
          @keyframes medicine-flow {
            0%, 60%, 100% { width: 70%; }
            70%, 90% { width: 20%; }
          }
          
          @keyframes float-gentle {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.8; }
            50% { transform: translateY(-8px) rotate(2deg); opacity: 1; }
          }
          
          @keyframes speech-appear {
            0%, 70%, 100% { opacity: 0; transform: scale(0.8) translateY(10px); }
            15%, 55% { opacity: 1; transform: scale(1) translateY(0px); }
          }
          
          @keyframes thought-bubble {
            0%, 80%, 100% { opacity: 0; transform: scale(0.9); }
            20%, 60% { opacity: 0.9; transform: scale(1); }
          }
          
          @keyframes injection-magic {
            0%, 80%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
            85%, 95% { opacity: 1; transform: scale(1.3) rotate(180deg); }
          }
          
          @keyframes blink {
            0%, 90%, 100% { transform: scaleY(1); }
            95% { transform: scaleY(0.1); }
          }
          
          @keyframes nervous-smile {
            0%, 100% { transform: translateX(-50%) scaleX(1); }
            50% { transform: translateX(-50%) scaleX(0.9); }
          }
          
          @keyframes sweat-drop {
            0%, 100% { opacity: 0; transform: translateY(0px); }
            30%, 70% { opacity: 0.7; transform: translateY(2px); }
          }
          
          @keyframes cross-glow {
            0%, 100% { opacity: 0.2; transform: translateX(-50%) scale(1); }
            50% { opacity: 0.4; transform: translateX(-50%) scale(1.1); }
          }
        `}</style>
      </div>

      {/* Professional loading text */}

          <div className="mt-4 text-sm text-gray-500 font-medium">
            Please wait while we prepare everything for you
            
          </div>

          

    </div>
  );
};

// Demo
const LoaderDemo = () => {
  return (
    <div>
      <ProfessionalMedicalLoader text="Loading your medical dashboard..." />
    </div>
  );
};

export default LoaderDemo;