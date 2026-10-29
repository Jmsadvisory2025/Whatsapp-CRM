import React from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

/**
 * CRMHeroGraphic
 * High-end animated interactive illustration inspired by the global WhatsApp CRM Loader:
 * - Orbiting CRM icons: 📢 Broadcast/Megaphone, 💬 Live Chat, 👥 Leads/Audience
 * - Central WhatsApp Pulse Core with subtle dashed rotating orbit
 * - Dynamic typing chat bubble with jumping 3-dot pulse animation
 * - Verified delivered card with animated double tick (✓✓) & progress accent
 * - Floating background constellation dot grid
 */
export const CRMHeroGraphic = () => {
  return (
    <div className="relative w-full max-w-sm sm:max-w-md h-[340px] flex items-center justify-center select-none">
      {/* Background Soft Aura & Constellation Dots */}
      <div className="absolute w-72 h-72 rounded-full bg-blue-100/70 blur-3xl pointer-events-none -z-10" />

      {/* Decorative Dot Matrix */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
        viewBox="0 0 360 360"
      >
        {[50, 90, 130, 170, 210, 250, 290, 330].flatMap((cx) =>
          [40, 80, 120, 160, 200, 240, 280, 320].map((cy) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.5" fill="#165DFF" />
          ))
        )}
      </svg>

      {/* Outer Dashed Orbit Track */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute w-[230px] h-[230px] rounded-full border-2 border-dashed border-[#165DFF]/20 pointer-events-none"
      />

      {/* Second Inner Subtle Orbit Track */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        className="absolute w-[160px] h-[160px] rounded-full border border-slate-200/60 pointer-events-none"
      />

      {/* ── Central WhatsApp CRM Pulse Core ── */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Pulsing Ripple Wave */}
        <motion.div
          animate={{ scale: [1, 1.45, 1], opacity: [0.35, 0, 0.35] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-24 h-24 rounded-full bg-emerald-400 -z-10"
        />

        {/* Core Glowing Green Badge */}
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#25D366] flex items-center justify-center text-white shadow-xl shadow-emerald-500/35 border-2 border-white"
        >
          <FaWhatsapp size={38} className="drop-shadow-sm" />
        </motion.div>
      </div>

      {/* ── Orbiting Satellite 1: Broadcast / Campaigns (📢) ── */}
      <motion.div
        animate={{
          x: [0, 85, 0, -85, 0],
          y: [-85, 0, 85, 0, -85],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        className="absolute z-20"
      >
        <div className="w-11 h-11 rounded-2xl bg-white border border-blue-100 shadow-lg shadow-blue-500/10 flex items-center justify-center text-lg hover:scale-110 transition-transform">
          📢
        </div>
      </motion.div>

      {/* ── Orbiting Satellite 2: Live Conversation (💬) ── */}
      <motion.div
        animate={{
          x: [85, 0, -85, 0, 85],
          y: [0, 85, 0, -85, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        className="absolute z-20"
      >
        <div className="w-11 h-11 rounded-2xl bg-white border border-emerald-100 shadow-lg shadow-emerald-500/10 flex items-center justify-center text-lg hover:scale-110 transition-transform">
          💬
        </div>
      </motion.div>

      {/* ── Orbiting Satellite 3: Leads & Audience (👥) ── */}
      <motion.div
        animate={{
          x: [-85, 0, 85, 0, -85],
          y: [0, -85, 0, 85, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        className="absolute z-20"
      >
        <div className="w-11 h-11 rounded-2xl bg-white border border-blue-100 shadow-lg shadow-blue-500/10 flex items-center justify-center text-lg hover:scale-110 transition-transform">
          👥
        </div>
      </motion.div>

      {/* ── Floating Top-Right: Typing Message Bubble with 3 pulsing dots ── */}
      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-4 right-1 sm:-right-2 z-20 bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200/70 px-4 py-2.5 rounded-2xl rounded-bl-xs shadow-md shadow-blue-500/5 flex items-center gap-2"
      >
        <span className="text-[11px] font-semibold text-[#165DFF]">Typing</span>
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
      </motion.div>

      {/* ── Floating Bottom-Left: Delivered Customer Lead Card ── */}
      <motion.div
        animate={{ y: [5, -5, 5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-4 left-0 sm:-left-3 z-20 bg-white/95 backdrop-blur-md border border-slate-100 p-3 rounded-2xl shadow-xl shadow-slate-200/70 flex items-center gap-3 min-w-[160px]"
      >
        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#172033]">Lead Captured</span>
            <span className="text-[9px] font-bold text-emerald-600">✓✓</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <motion.div
              animate={{ width: ["0%", "100%", "100%"] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-[#165DFF] to-[#25D366] rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* ── Floating Live Badge: Top-Left ── */}
      <motion.div
        animate={{ y: [-3, 3, -3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-8 left-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-slate-100 flex items-center gap-2 z-20"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[11px] font-semibold text-[#172033]">Meta Cloud API</span>
      </motion.div>
    </div>
  );
};

export default CRMHeroGraphic;
