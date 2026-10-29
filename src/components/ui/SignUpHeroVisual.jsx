import React from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { CheckCircle2, ShieldCheck, Zap, Users, MessageSquare } from "lucide-react";

/**
 * SignUpHeroVisual
 * A creative, modern CRM workspace onboarding visual:
 * - Onboarding Journey Cards with progressive animated ticks
 * - Live Customer Lead Card with pulsing WhatsApp live chat badge
 * - Broadcast Reach Metric Pill (+10k delivered)
 * - 3D glassmorphic floating badges with natural physics
 */
export const SignUpHeroVisual = () => {
  return (
    <div className="relative w-full max-w-lg py-4 flex items-center justify-center select-none min-h-[360px]">
      
      {/* Ambient background soft glow circles */}
      <div className="absolute w-80 h-80 rounded-full bg-blue-100/60 blur-3xl pointer-events-none -z-10" />
      <div className="absolute w-60 h-60 rounded-full bg-cyan-100/50 blur-2xl pointer-events-none -z-10 translate-x-12 translate-y-12" />

      {/* Decorative Dot Matrix */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none -z-10"
        viewBox="0 0 400 340"
      >
        {[40, 90, 140, 190, 240, 290, 340].flatMap((cx) =>
          [30, 80, 130, 180, 230, 280].map((cy) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.5" fill="#165DFF" />
          ))
        )}
      </svg>

      {/* ── Main Container: Floating CRM Command Hub Stack ── */}
      <div className="relative w-full max-w-sm sm:max-w-md flex flex-col items-center">
        
        {/* Main Central Card: Onboarding Roadmap / Workspace Ready */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl shadow-blue-500/10 border border-slate-100 relative z-10"
        >
          {/* Card Header with Live Badge */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#128C7E] to-[#25D366] text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <FaWhatsapp size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#172033] tracking-tight">Setup Workspace</h4>
                <p className="text-[10px] text-[#64748B]">Ready in under 2 minutes</p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live API
            </span>
          </div>

          {/* Interactive Steps List */}
          <div className="space-y-3 pt-4">
            
            {/* Step 1: Organisation & Auth */}
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-blue-50/70 border border-blue-100/70">
              <div className="w-7 h-7 rounded-xl bg-[#165DFF] text-white flex items-center justify-center shrink-0">
                <CheckCircle2 size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#172033]">Organisation Workspace</p>
                <p className="text-[10px] text-[#64748B] truncate">Team access & multi-agent routing</p>
              </div>
              <span className="text-[10px] font-bold text-[#165DFF]">01</span>
            </div>

            {/* Step 2: Official Meta Cloud API */}
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-100/70">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#128C7E] to-[#25D366] text-white flex items-center justify-center shrink-0">
                <Zap size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#172033]">Meta WhatsApp API</p>
                <p className="text-[10px] text-[#64748B] truncate">Verified Business Phone & Webhooks</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600">02</span>
            </div>

            {/* Step 3: Automated Broadcasts */}
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-cyan-50/50 border border-cyan-100/70">
              <div className="w-7 h-7 rounded-xl bg-[#38BDF8] text-white flex items-center justify-center shrink-0">
                <MessageSquare size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#172033]">Launch Broadcasts</p>
                <p className="text-[10px] text-[#64748B] truncate">CSV contact sync & CRM chatbots</p>
              </div>
              <span className="text-[10px] font-bold text-[#0284C7]">03</span>
            </div>

          </div>

          {/* Quick Progress Indicator */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#64748B]">
            <span className="font-medium">Account Readiness</span>
            <span className="font-bold text-[#165DFF]">100% Secure</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <motion.div
              animate={{ width: ["30%", "100%"] }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[#165DFF] via-[#38BDF8] to-[#25D366] rounded-full"
            />
          </div>
        </motion.div>

        {/* ── Floating Satellite 1: Top-Right Delivered Pill ── */}
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-xl shadow-blue-500/10 border border-slate-100 flex items-center gap-2.5 z-20"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
            ✓✓
          </div>
          <div>
            <p className="text-[10px] text-[#64748B]">Daily Deliverability</p>
            <p className="text-xs font-bold text-emerald-600">99.8% Success</p>
          </div>
        </motion.div>

        {/* ── Floating Satellite 2: Bottom-Left Customer Engagement Pill ── */}
        <motion.div
          animate={{ y: [5, -5, 5] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-5 -left-4 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-xl shadow-blue-500/10 border border-slate-100 flex items-center gap-2.5 z-20"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#165DFF] flex items-center justify-center">
            <Users size={16} />
          </div>
          <div>
            <p className="text-[10px] text-[#64748B]">Audience Growth</p>
            <p className="text-xs font-bold text-[#172033]">+10,000 Leads</p>
          </div>
        </motion.div>

        {/* ── Floating Satellite 3: Meta Verified Shield (Top-Left) ── */}
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-3 -left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg shadow-slate-200/60 border border-slate-100 flex items-center gap-1.5 z-20"
        >
          <ShieldCheck size={14} className="text-[#165DFF]" />
          <span className="text-[10px] font-semibold text-[#172033]">Official Meta Partner</span>
        </motion.div>

      </div>
    </div>
  );
};

export default SignUpHeroVisual;
