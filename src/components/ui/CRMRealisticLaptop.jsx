import React from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

/**
 * Realistic Laptop Workspace with Global Loader's Polish & Micro-interactions:
 * - Ultra-clean 3D-perspective styled Laptop Frame with display bezel, webcam & glossy reflection
 * - Live conversational chat UI inside laptop:
 *    - Incoming contact query
 *    - Outgoing WhatsApp green bubble with pulsing double-tick (✓✓)
 *    - Active typing bubble with 3 jumping blue dots (pulse-dot from global loader)
 * - Modern realistic plant pot on left with subtle leaf breathing animation
 * - 3 Floating Glassmorphic Badges (Users, Analytics Chart, Paper Airplane) with smooth float-gentle physics
 * - Subtle ambient depth shadow & soft background radial aura
 */
export const CRMRealisticLaptop = () => {
  return (
    <div className="relative w-full max-w-lg py-6 flex items-center justify-center select-none">
      
      {/* ── Soft Radial Ambient Aura & Constellation Dots (from Loader) ── */}
      <div className="absolute w-80 h-80 rounded-full bg-blue-100/60 blur-3xl pointer-events-none -z-10" />

      {/* Background Micro Dot Grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none -z-10"
        viewBox="0 0 400 320"
      >
        {[40, 80, 120, 160, 200, 240, 280, 320, 360].flatMap((cx) =>
          [30, 70, 110, 150, 190, 230, 270].map((cy) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" fill="#165DFF" />
          ))
        )}
      </svg>

      {/* ── Realistic Potted Plant (Left Side) ── */}
      <div className="absolute -left-2 bottom-6 z-20 hidden sm:flex flex-col items-center pointer-events-none">
        <div className="relative w-16 h-24">
          {/* Leaves with subtle natural sway */}
          <motion.div
            animate={{ rotate: [-28, -26, -28] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-7 left-1 w-6 h-13 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full shadow-xs origin-bottom"
          />
          <motion.div
            animate={{ rotate: [12, 15, 12] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-8 left-5 w-6 h-15 bg-gradient-to-t from-emerald-500 to-teal-300 rounded-full shadow-xs origin-bottom"
          />
          <motion.div
            animate={{ rotate: [32, 30, 32] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-6 left-8 w-6 h-12 bg-gradient-to-t from-teal-600 to-emerald-400 rounded-full shadow-xs origin-bottom"
          />
          {/* Ceramic Pot with realistic gradient & drop shadow */}
          <div className="absolute bottom-0 left-2.5 w-11 h-8 bg-gradient-to-b from-white to-slate-100 rounded-b-2xl border border-slate-200/80 shadow-md flex items-center justify-center">
            <div className="w-7 h-1 bg-slate-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* ── Floating Badge 1: Top-Left (Users Group) ── */}
      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-3 left-4 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl shadow-blue-500/10 border border-slate-100 flex items-center gap-2 z-30"
      >
        <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center text-[#165DFF]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <span className="text-[11px] font-semibold text-[#172033] hidden sm:inline">Active CRM</span>
      </motion.div>

      {/* ── Floating Badge 2: Top-Right (Analytics Bar Chart) ── */}
      <motion.div
        animate={{ y: [5, -5, 5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-2 right-4 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl shadow-blue-500/10 border border-slate-100 flex items-center gap-2 z-30"
      >
        <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center text-[#165DFF]">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 19h4V9H4v10zm6 0h4V5h-4v14zm6 0h4v-7h-4v7z" />
          </svg>
        </div>
        <span className="text-[11px] font-bold text-emerald-600">99.8%</span>
      </motion.div>

      {/* ── Floating Badge 3: Middle-Right (Send / Paper Airplane) ── */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-24 -right-3 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-xl shadow-blue-500/10 border border-slate-100 flex items-center justify-center z-30"
      >
        <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center text-[#165DFF]">
          <svg className="w-4 h-4 -rotate-45 -translate-y-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </div>
      </motion.div>

      {/* ── REALISTIC LAPTOP FRAME CONTAINER ── */}
      <div className="w-full sm:ml-5 relative">
        {/* Laptop Screen Bezel */}
        <div className="w-full bg-[#1e293b] rounded-t-2xl p-2.5 shadow-2xl shadow-blue-900/15 border border-slate-700/50">
          
          {/* Top Bezel Webcam Notch & Dot */}
          <div className="flex items-center justify-center pb-2 relative">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-500 shadow-inner" />
          </div>

          {/* Screen Glass Interior */}
          <div className="w-full bg-white rounded-xl overflow-hidden border border-slate-100">
            {/* CRM Browser Header Bar */}
            <div className="bg-[#f8fafc] px-3 py-2 border-b border-slate-100 flex items-center justify-between">
              {/* Traffic light window controls */}
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block" />
              </div>

              {/* URL Address Pill */}
              <div className="px-4 py-0.5 bg-white rounded-full border border-slate-200/70 text-[9px] text-slate-400 font-medium tracking-tight flex items-center gap-1 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                crm.jmsadvisory.com
              </div>

              <div className="w-8" />
            </div>

            {/* Laptop Screen CRM Inner Workspace */}
            <div className="grid grid-cols-12 h-56 bg-[#f8fafc]">
              
              {/* Left Contacts Navigation Column */}
              <div className="col-span-4 bg-white border-r border-slate-100 p-2 space-y-2">
                {/* Active contact with live blue pill */}
                <div className="w-full p-1.5 rounded-lg bg-blue-50 border border-blue-100 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#165DFF] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    J
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="w-12 h-2 bg-[#165DFF]/40 rounded-full" />
                    <div className="w-8 h-1.5 bg-slate-300 rounded-full mt-1" />
                  </div>
                </div>

                {/* Secondary contacts */}
                {[1, 2, 3].map((item) => (
                  <div key={item} className="w-full p-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="w-14 h-2 bg-slate-200 rounded-full" />
                      <div className="w-9 h-1.5 bg-slate-100 rounded-full mt-1" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Live WhatsApp Chat Area */}
              <div className="col-span-8 flex flex-col justify-between p-3 bg-[#efeae2]/40 relative">
                
                {/* Chat Messages */}
                <div className="space-y-3 pt-1">
                  {/* Incoming Client Query Bubble */}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white p-2.5 rounded-2xl rounded-tl-xs shadow-xs border border-slate-100 max-w-[85%]"
                  >
                    <p className="text-[10px] text-[#172033] font-medium leading-tight">
                      Hello! How can I scale my WhatsApp campaigns?
                    </p>
                    <span className="text-[8px] text-slate-400 block text-right mt-1 font-mono">10:42 AM</span>
                  </motion.div>

                  {/* Outgoing Official WhatsApp Campaign Bubble */}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-[#DCF8C6] p-2.5 rounded-2xl rounded-tr-xs shadow-xs border border-emerald-200/50 ml-auto max-w-[88%]"
                  >
                    <p className="text-[10px] text-[#172033] font-medium leading-tight">
                      Automate broadcasts & instant lead chats with Meta API! 🚀
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[8px] text-slate-500 font-mono">10:43 AM</span>
                      <span className="text-[9px] font-bold text-emerald-600">✓✓</span>
                    </div>
                  </motion.div>

                  {/* Active Typing Pulse Indicator (from Loader) */}
                  <div className="bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl rounded-tl-xs border border-slate-100 shadow-2xs w-fit flex items-center gap-1.5">
                    <span className="text-[9px] text-slate-500 font-medium">JMS Bot</span>
                    <div className="flex items-center gap-1">
                      {[0, 0.2, 0.4].map((delay, i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay }}
                          className="w-1.5 h-1.5 rounded-full bg-[#165DFF]"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Input Field */}
                <div className="h-7 bg-white rounded-xl flex items-center px-2.5 justify-between border border-slate-200/80 shadow-2xs">
                  <span className="text-[9px] text-slate-400">Type a message...</span>
                  <div className="w-4 h-4 rounded-full bg-[#165DFF] text-white flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 -rotate-45" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* ── Laptop Base Chassis (Physical Realism) ── */}
        <div className="w-full h-3 bg-gradient-to-b from-[#cbd5e1] to-[#94a3b8] rounded-b-xl shadow-lg relative flex items-center justify-center">
          {/* Thumb opening groove */}
          <div className="w-14 h-1 bg-[#64748b]/60 rounded-full" />
        </div>
      </div>

    </div>
  );
};

export default CRMRealisticLaptop;
