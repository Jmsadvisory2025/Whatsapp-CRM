import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  RefreshCw,
  CheckCircle2,
  X,
  Calendar,
} from "lucide-react";
import { fetchCustomers, fetchConversationMessages } from "../store/whatsappSlice";
import WhatsappSidebar from "../components/WhatsappSidebar";
import ChatArea from "../components/ChatArea";

const stripPlus = (str) => String(str ?? "").replace(/^\+/, "");

const formatShortDate = (dateStr, fallback) => {
  if (!dateStr) return fallback;
  const d = new Date(dateStr);
  if (isNaN(d)) return fallback;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const STATUS_TABS = [
  { key: "", label: "All Chats" },
  { key: "confirmed", label: "Leads", dot: "bg-[#0EA5E9]" },
  { key: "prospect", label: "Prospects", dot: "bg-[#8B5CF6]" },
];

const Whatsapp = () => {
  const dispatch = useDispatch();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(true);
  const [showBulkMessage, setShowBulkMessage] = useState(false);

  const [filters, setFilters] = useState({
    number: "",
    from_date: "",
    to_date: "",
    status: "",
  });

  const { isLoading, wabaPhone, selectedCustomer, pagination } = useSelector(
    (s) => s.whatsapp
  );

  const handleRefresh = () => {
    dispatch(fetchCustomers({ filters, page: pagination?.currentPage || 1 }));
    if (selectedCustomer?.conversation_id) {
      dispatch(fetchConversationMessages(selectedCustomer.conversation_id));
    }
  };

  const handleStatusTabChange = (statusKey) => {
    const updated = { ...filters, status: statusKey };
    setFilters(updated);
    dispatch(fetchCustomers({ filters: updated, page: 1 }));
  };

  const handleDateChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    dispatch(fetchCustomers({ filters: updated, page: 1 }));
  };

  const handleClearDates = () => {
    const updated = { ...filters, from_date: "", to_date: "" };
    setFilters(updated);
    dispatch(fetchCustomers({ filters: updated, page: 1 }));
  };

  const handleClearFilters = () => {
    const cleared = { number: "", from_date: "", to_date: "", status: "" };
    setFilters(cleared);
    dispatch(fetchCustomers({ page: 1 }));
  };

  const hasDateFilter = Boolean(filters.from_date || filters.to_date);
  const hasAnyFilter = Boolean(
    filters.number || filters.from_date || filters.to_date || filters.status
  );

  if (showBulkMessage) {
    return (
      <div className="h-[calc(100vh-56px)] lg:h-screen w-full p-5 sm:p-6 lg:p-7 flex flex-col gap-5 bg-[#FAFAFC] font-sans text-[#172033] overflow-hidden">
        <div className="flex-1 w-full flex overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-blue-500/[0.03]">
          <BulkMessage onClose={() => setShowBulkMessage(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-56px)] lg:h-screen w-full p-5 sm:p-6 lg:p-7 flex flex-col gap-5 bg-[#FAFAFC] font-sans text-[#172033] overflow-hidden">

      {/* ── Page Header with Inline Status Tabs & From-To Date Filter ── */}
      <div className="relative z-30 flex items-center justify-between flex-wrap gap-3 pb-3.5 min-h-[56px] border-b border-[#E5E7EB]/80 flex-shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#172033] leading-tight">
            WhatsApp Inbox
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-normal flex items-center gap-1.5">
            <span>Manage customer conversations and respond to enquiries in real time.</span>
          </p>
        </div>

        {/* ── Right Toolbar: Status Tabs + Inline From/To Dates + Refresh ── */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Quick Status Segmented Tabs */}
          <div className="h-9 flex items-center bg-white p-1 rounded-xl border border-[#E5E7EB] shadow-2xs">
            {STATUS_TABS.map((tab) => {
              const active = filters.status === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleStatusTabChange(tab.key)}
                  className={`h-full flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-[#165DFF] text-white shadow-xs shadow-blue-500/20"
                      : "text-[#64748B] hover:text-[#172033] hover:bg-slate-50"
                  }`}
                >
                  {tab.dot && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        active ? "bg-white" : tab.dot
                      }`}
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Compact From - To Calendar Trigger (No dd-mm-yyyy text) */}
          <div
            className={`h-9 flex items-center gap-1 px-2.5 rounded-xl border transition-all shadow-2xs ${
              hasDateFilter
                ? "bg-blue-50/50 border-[#165DFF]/40"
                : "bg-white border-[#E5E7EB]"
            }`}
          >
            {/* From Trigger */}
            <div className="relative flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg hover:bg-slate-100/80 transition-colors cursor-pointer">
              <Calendar
                size={13}
                className={
                  filters.from_date
                    ? "text-[#165DFF] flex-shrink-0"
                    : "text-[#64748B] flex-shrink-0"
                }
              />
              <span
                className={`text-xs font-semibold whitespace-nowrap ${
                  filters.from_date ? "text-[#165DFF]" : "text-[#172033]"
                }`}
              >
                {formatShortDate(filters.from_date, "From")}
              </span>
              <input
                type="date"
                title="Select From Date"
                value={filters.from_date}
                onClick={(e) => e.currentTarget.showPicker?.()}
                onChange={(e) => handleDateChange("from_date", e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <span className="text-slate-300 select-none text-xs">|</span>

            {/* To Trigger */}
            <div className="relative flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg hover:bg-slate-100/80 transition-colors cursor-pointer">
              <Calendar
                size={13}
                className={
                  filters.to_date
                    ? "text-[#165DFF] flex-shrink-0"
                    : "text-[#64748B] flex-shrink-0"
                }
              />
              <span
                className={`text-xs font-semibold whitespace-nowrap ${
                  filters.to_date ? "text-[#165DFF]" : "text-[#172033]"
                }`}
              >
                {formatShortDate(filters.to_date, "To")}
              </span>
              <input
                type="date"
                title="Select To Date"
                value={filters.to_date}
                onClick={(e) => e.currentTarget.showPicker?.()}
                onChange={(e) => handleDateChange("to_date", e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {hasDateFilter && (
              <button
                onClick={handleClearDates}
                title="Clear dates"
                className="ml-0.5 p-0.5 rounded-md text-[#64748B] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-9 flex items-center gap-1.5 text-xs font-semibold px-3.5 bg-white border border-[#E5E7EB] rounded-xl text-[#172033] hover:border-[#165DFF]/40 hover:text-[#165DFF] hover:bg-blue-50/30 transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw
              size={13}
              className={isLoading ? "animate-spin text-[#165DFF]" : "text-[#64748B]"}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Main Chat Workspace Card ── */}
      <div className="relative z-10 flex-1 flex w-full min-h-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-blue-500/[0.03]">
        {/* ── Sidebar ── */}
        <div
          className={`flex-shrink-0 flex flex-col h-full overflow-hidden border-r border-slate-200/80 bg-white ${
            mobileSidebarOpen ? "flex" : "hidden"
          } md:flex w-full md:w-[320px] lg:w-[350px]`}
        >
          <WhatsappSidebar
            filters={filters}
            hasActiveFilters={hasAnyFilter}
            onClearFilters={handleClearFilters}
            onSelectCustomer={() => setMobileSidebarOpen(false)}
          />
        </div>

        {/* ── Chat Area ── */}
        <div
          className={`flex-1 flex flex-col overflow-hidden bg-[#FAFAFC] ${
            mobileSidebarOpen ? "hidden md:flex" : "flex"
          }`}
        >
          <ChatArea
            onBack={() => setMobileSidebarOpen(true)}
            onOpenBulkMessage={() => setShowBulkMessage(true)}
          />
        </div>
      </div>

    </div>
  );
};

export default Whatsapp;
