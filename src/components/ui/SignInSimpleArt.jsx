import React from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { ShieldCheck, Send, Sparkles, MessageSquare, TrendingUp, BarChart3, LineChart } from "lucide-react";

/**
 * SignInSimpleArt
 * Abstract Minimal Illustration:
 * Features a central sleek Analytics Graph (representing CRM activity, leads growth & campaign delivery)
 * surrounded by orbit rings and floating satellites (WhatsApp, Shield, Send, Message).
 */
export const SignInSimpleArt = () => {
  return (
    <div className="relative w-full max-w-lg h-96 flex items-center justify-center select-none py-2">
      {/* Soft Ambient Radial Lights */}
      <div className="absolute w-80 h-80 rounded-full bg-blue-100/50 blur-3xl pointer-events-none" />
      <div className="absolute w-64 h-64 rounded-full bg-indigo-100/40 blur-2xl pointer-events-none translate-x-10 -translate-y-8" />
      <div className="absolute w-52 h-52 rounded-full bg-cyan-100/40 blur-2xl pointer-events-none -translate-x-10 translate-y-8" />

      {/* Orbit Rings / Geometry Guidelines */}
      <div className="absolute w-72 h-72 rounded-full border border-slate-200/60 pointer-events-none" />
      <div className="absolute w-96 h-96 rounded-full border border-slate-200/40 pointer-events-none" />
      <div className="absolute w-52 h-52 rounded-full border border-dashed border-blue-200/60 pointer-events-none" />

      {/* Central Glassmorphic Glowing Orb / Platform */}
      <motion.div
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-40 h-40 rounded-3xl bg-gradient-to-tr from-white/95 to-white/75 backdrop-blur-md shadow-2xl shadow-blue-500/10 border border-white flex flex-col items-center justify-center relative z-10 p-4"
      >
        {/* Sleek Central Analytic Graph */}
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border border-blue-100/60 p-3.5 flex flex-col justify-between shadow-inner">
          {/* Top mini header: Trend icon & status */}
          <div className="flex items-center justify-between">
            <div className="w-6 h-6 rounded-lg bg-[#165DFF] text-white flex items-center justify-center shadow-xs">
              <TrendingUp size={13} />
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-600">Active</span>
            </div>
          </div>

          {/* Dynamic rising bar chart representation */}
          <div className="flex items-end justify-between gap-1.5 px-1 pt-2 h-12">
            <motion.div 
              animate={{ height: ["35%", "55%", "35%"] }} 
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} 
              className="w-3 rounded-md bg-blue-300/80" 
            />
            <motion.div 
              animate={{ height: ["50%", "75%", "50%"] }} 
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} 
              className="w-3 rounded-md bg-sky-400" 
            />
            <motion.div 
              animate={{ height: ["65%", "90%", "65%"] }} 
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} 
              className="w-3 rounded-md bg-[#165DFF]" 
            />
            <motion.div 
              animate={{ height: ["75%", "100%", "75%"] }} 
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.1 }} 
              className="w-3 rounded-md bg-gradient-to-t from-[#165DFF] to-blue-400" 
            />
          </div>
        </div>
      </motion.div>

      {/* Floating Satellite 1: Top-Right Secure Shield (Blue Theme) */}
      <motion.div
        animate={{ y: [-8, 8, -8], x: [3, -3, 3] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-8 right-16 w-14 h-14 rounded-2xl bg-white shadow-xl shadow-blue-500/15 border border-slate-100/80 flex items-center justify-center text-[#165DFF] z-20"
      >
        <ShieldCheck size={26} />
      </motion.div>

      {/* Floating Satellite 2: Bottom-Left Instant Send / Dispatcher (Sky Blue Theme) */}
      <motion.div
        animate={{ y: [6, -6, 6], x: [-3, 3, -3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-16 w-14 h-14 rounded-2xl bg-white shadow-xl shadow-cyan-500/15 border border-slate-100/80 flex items-center justify-center text-[#0ea5e9] z-20"
      >
        <Send size={22} className="translate-x-0.5" />
      </motion.div>

      {/* Floating Satellite 3: Top-Left Conversational Message Node */}
      <motion.div
        animate={{ y: [5, -5, 5] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-14 left-14 w-12 h-12 rounded-2xl bg-white shadow-lg shadow-slate-200/80 border border-slate-100 flex items-center justify-center text-slate-700 z-20"
      >
        <MessageSquare size={20} className="text-[#165DFF]" />
      </motion.div>

      {/* Floating Satellite 4: Bottom-Right Meta WhatsApp Badge */}
      <motion.div
        animate={{ y: [-6, 6, -6] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 right-14 w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#128C7E] to-[#25D366] text-white shadow-lg shadow-emerald-500/20 border border-white flex items-center justify-center z-20"
      >
        <FaWhatsapp size={22} />
      </motion.div>

      {/* Dynamic Geometric Accent Dots */}
      <div className="absolute top-1/2 -left-2 w-3 h-3 rounded-full bg-[#165DFF]/40 animate-ping" />
      <div className="absolute bottom-1/4 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
      <div className="absolute top-1/3 right-8 w-2 h-2 rounded-full bg-sky-400/50" />
    </div>
  );
};

export default SignInSimpleArt;
