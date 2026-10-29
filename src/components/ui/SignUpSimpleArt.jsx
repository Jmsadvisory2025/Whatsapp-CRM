import React from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { Building2, KeyRound, Megaphone, Users, Sparkles } from "lucide-react";

/**
 * SignUpSimpleArt
 * Minimalist, elegant, icon-driven illustration for Sign Up:
 * Focuses on creating your workspace, linking WhatsApp & scaling outreach without numbers or percentages.
 */
export const SignUpSimpleArt = () => {
  return (
    <div className="relative w-full max-w-lg h-full flex items-center justify-center select-none py-2">
      {/* Soft ambient background glow */}
      <div className="absolute w-72 h-72 rounded-full bg-cyan-100/40 blur-3xl pointer-events-none" />
      <div className="absolute w-56 h-56 rounded-full bg-blue-100/40 blur-2xl pointer-events-none -translate-x-8 translate-y-6" />

      {/* Main Glassmorphic Hub Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[400px] bg-white rounded-3xl p-6 shadow-xl shadow-blue-500/5 border border-slate-100 relative z-10 flex flex-col justify-between gap-4 my-auto"
      >
        {/* Step Row 1: Lead Management */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-left">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#165DFF] flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-[#172033] leading-tight">
              Lead Management
            </h4>
            <p className="text-xs text-[#64748B] leading-normal mt-0.5">
              Organise and track your leads efficiently.
            </p>
          </div>
        </div>

        {/* Step Row 2: Customer Conversations */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-left">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#128C7E] to-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs shadow-emerald-500/20">
            <FaWhatsapp size={19} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-[#172033] leading-tight">
              Customer Conversations
            </h4>
            <p className="text-xs text-[#64748B] leading-normal mt-0.5">
              Manage customer chats seamlessly.
            </p>
          </div>
        </div>

        {/* Step Row 3: Campaign Management */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 text-left">
          <div className="w-10 h-10 rounded-xl bg-[#165DFF] text-white flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/20">
            <Megaphone size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-[#172033] leading-tight">
              Campaign Management
            </h4>
            <p className="text-xs text-[#64748B] leading-normal mt-0.5">
              Create, manage, and monitor WhatsApp campaigns.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Floating Accent: Top-Left Workspace Badge */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-3 left-4 sm:left-6 w-11 h-11 rounded-2xl bg-white text-[#165DFF] shadow-lg shadow-slate-200/70 border border-slate-100 flex items-center justify-center z-20"
      >
        <Building2 size={18} />
      </motion.div>
    </div>
  );
};

export default SignUpSimpleArt;
