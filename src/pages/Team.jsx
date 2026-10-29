// src/pages/Team.jsx
// Profile: Clean Direct Card Grid (No nested outer card) with + Phone Number

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  Shield,
  Wifi,
  WifiOff,
  Phone,
  RefreshCw,
  Mail,
  Hash,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { fetchWABAStatus } from "../store/metaConnectSlice";
import { fetchMe } from "../store/authSlice";

const Team = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    organization,
    org_email,
    owner_email,
  } = useSelector((s) => s.auth);

  const {
    wabaStatus,
    wabaId,
    phoneNumber,
    phoneNumberId,
    isLoadingStatus: metaLoading,
  } = useSelector((s) => s.metaConnect);

  const loadData = () => {
    dispatch(fetchWABAStatus());
    dispatch(fetchMe());
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const isWhatsAppConnected =
    wabaStatus === "connected" || Boolean(wabaId && phoneNumberId);

  const orgNameVal =
    organization ||
    localStorage.getItem("userOrg") ||
    localStorage.getItem("organization") ||
    "—";

  const emailVal =
    owner_email ||
    org_email ||
    localStorage.getItem("ownerEmail") ||
    localStorage.getItem("orgEmail") ||
    "—";

  // Ensure phone number has a "+" prefix
  const rawPhone = String(phoneNumber || "").trim();
  const phoneVal = rawPhone
    ? rawPhone.startsWith("+")
      ? rawPhone
      : `+${rawPhone}`
    : "—";

  const wabaIdVal = wabaId || "—";
  const phoneIdVal = phoneNumberId || localStorage.getItem("phoneNumberId") || "—";

  // Ordered 6 cards: Organization -> Email -> Status -> Phone -> WABA ID -> Phone Number ID
  const cards = [
    {
      icon: Building2,
      label: "ORGANIZATION",
      value: orgNameVal,
    },
    {
      icon: Mail,
      label: "EMAIL",
      value: emailVal,
    },
    {
      icon: isWhatsAppConnected ? Wifi : WifiOff,
      label: "STATUS",
      value: isWhatsAppConnected ? "Connected" : "Disconnected",
      badge: (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            isWhatsAppConnected
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-slate-100 text-[#64748B] border border-slate-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isWhatsAppConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
            }`}
          />
          <span>{isWhatsAppConnected ? "Active" : "Offline"}</span>
        </span>
      ),
    },
    {
      icon: Phone,
      label: "PHONE NUMBER",
      value: phoneVal,
      isMono: true,
    },
    {
      icon: Shield,
      label: "WABA ID",
      value: wabaIdVal,
      isMono: true,
    },
    {
      icon: Hash,
      label: "PHONE NUMBER ID",
      value: phoneIdVal,
      isMono: true,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#FAFAFC] p-5 sm:p-6 lg:p-7 space-y-5 font-sans text-[#172033]">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3.5 min-h-[56px] border-b border-[#E5E7EB]/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#172033] leading-tight">
            Profile
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-normal">
            View your organization details and connected WhatsApp Business account.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={loadData}
            disabled={metaLoading}
            className="h-9 flex items-center gap-1.5 text-xs font-semibold px-3.5 bg-white border border-[#E5E7EB] rounded-xl text-[#172033] hover:border-[#165DFF]/40 hover:text-[#165DFF] hover:bg-blue-50/30 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              size={13}
              className={metaLoading ? "animate-spin text-[#165DFF]" : "text-[#64748B]"}
            />
            <span>Refresh</span>
          </button>

          {/* Reconnect WhatsApp in Green */}
          <button
            onClick={() => navigate("/setup")}
            className="h-9 flex items-center gap-1.5 text-xs font-semibold px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl transition-all shadow-sm shadow-emerald-500/20 cursor-pointer"
          >
            <FaWhatsapp className="text-sm" />
            <span>{isWhatsAppConnected ? "Reconnect WhatsApp" : "Connect WhatsApp"}</span>
          </button>
        </div>
      </div>

      {/* ── Direct Clean 3-Column Card Grid (No outer big card wrapper) ── */}
      {metaLoading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white border border-slate-200/80 rounded-2xl">
          <RefreshCw size={24} className="animate-spin text-[#165DFF] mb-2" />
          <p className="text-xs text-[#64748B]">Loading details...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-[#165DFF]/40 hover:shadow-sm transition-all flex flex-col justify-between min-h-[125px]"
              >
                {/* Card Top: Icon + Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50/70 border border-blue-100/80 flex items-center justify-center text-[#165DFF]">
                    <Icon size={16} />
                  </div>
                  {card.badge}
                </div>

                {/* Card Bottom: Label + Value */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
                    {card.label}
                  </p>
                  <p
                    className={`text-sm font-bold text-[#172033] break-all ${
                      card.isMono ? "font-mono" : ""
                    }`}
                  >
                    {card.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Team;
