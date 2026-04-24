import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomers,
  setSelectedCustomer,
  fetchConversationMessages,
} from "../store/whatsappSlice";
import {
  MessageCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Search,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import shaheye from '../assets/images/whatsapp/shaheye.png';

/* ─── Config ─────────────────────────────────────────────── */

const statusConfig = {
  prospect:  { label: "Prospect",  text: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200"   },
  lead:      { label: "Lead",      text: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200"  },
  customer:  { label: "Customer",  text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  patient:   { label: "Patient",   text: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-200"  },
  confirmed: { label: "Confirmed", text: "text-green-700",   bg: "bg-green-50",   border: "border-green-200"  },
  follow_up: { label: "Follow Up", text: "text-orange-600",  bg: "bg-orange-50",  border: "border-orange-200"  },
};

const getStatus = (key) =>
  statusConfig[key] ?? { label: key ?? "Unknown", text: "text-gray-500", bg: "bg-gray-100", border: "border-gray-200" };

const PALETTES = [
  { bg: "#dfe5e7", text: "#4a5568" },
  { bg: "#cfe9ba", text: "#2f6543" },
  { bg: "#ffd279", text: "#7a5800" },
  { bg: "#c9e6ff", text: "#1a5f8c" },
  { bg: "#f4c2c2", text: "#8c2e2e" },
  { bg: "#d4baff", text: "#5b2c8c" },
];
const getPalette = (id) => PALETTES[Number(id) % PALETTES.length];

/* ─── Helpers ────────────────────────────────────────────── */

const stripPlus = (str) => String(str ?? "").replace(/^\+/, "");

const isRealName = (name, phone) => {
  if (!name) return false;
  const s = stripPlus(String(phone ?? ""));
  if (name === phone || name === s) return false;
  if (/^\d+$/.test(name)) return false;
  return true;
};

const getDisplayName = (name, phone) =>
  isRealName(name, phone) ? name : `+${stripPlus(phone)}`;

const getInitials = (name, phone) => {
  if (isRealName(name, phone)) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.trim().slice(0, 2).toUpperCase();
  }
  return stripPlus(phone).slice(-2);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

/* ─── Component ──────────────────────────────────────────── */

const WhatsappSidebar = ({ onSelectCustomer }) => {
  const dispatch = useDispatch();
  const { customers, selectedCustomer, isLoading, error, pagination } = useSelector(
    (s) => s.whatsapp
  );

  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    number: "",
    from_date: "",
    to_date: "",
    status: "",
  });

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const handleApplyFilters = () => {
    dispatch(fetchCustomers({ filters }));
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({ number: "", from_date: "", to_date: "", status: "" });
    dispatch(fetchCustomers());
    setShowFilters(false);
  };

  const handleSelect = (customer) => {
    dispatch(setSelectedCustomer(customer));
    dispatch(fetchConversationMessages(customer.conversation_id));
    onSelectCustomer?.(customer);
  };

  const activeFilterList = [];
  if (filters.number) activeFilterList.push({ key: "number", label: "Phone", value: filters.number });
  if (filters.status) activeFilterList.push({ key: "status", label: "Status", value: getStatus(filters.status).label });
  if (filters.from_date) activeFilterList.push({ key: "from_date", label: "From", value: filters.from_date });
  if (filters.to_date) activeFilterList.push({ key: "to_date", label: "To", value: filters.to_date });

  const removeFilter = (key) => {
    const newFilters = { ...filters, [key]: "" };
    setFilters(newFilters);
    dispatch(fetchCustomers({ filters: newFilters }));
  };

  const filtered = customers.filter((c) => {
    if (!searchText.trim()) return true;
    const q = searchText.toLowerCase();
    const name = (c.name ?? "").toLowerCase();
    const phone = stripPlus(c.phone).toLowerCase();
    return name.includes(q) || phone.includes(q);
  });

  const hasActiveFilters =
    filters.number || filters.from_date || filters.to_date || filters.status;

  return (
    <div className="flex flex-col h-full" style={{ background: "#fff" }}>

      {/* ── Header ── */}
      <div
        className="px-4 flex items-center justify-between flex-shrink-0"
        style={{ background: "#f0f2f5", height: "59px" }}
      >
        <div className="flex items-center gap-2.5">
          <img src={shaheye} alt="" className="w-[50px] rounded-full" />
          <div className="hidden sm:block">
            <h2 className="text-[15px] font-semibold text-[#111b21] leading-tight">Chats</h2>
            <p className="text-[11px] leading-tight text-[#667781]">Total Chats {(pagination.count || customers.length || 0).toLocaleString()} 
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isLoading && (
            <Loader2 size={16} className="text-[#54656f] animate-spin mr-2" />
          )}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="relative p-2 rounded-full transition-colors hover:bg-gray-200"
            style={{ color: showFilters ? "#00a884" : "#54656f" }}
          >
            <SlidersHorizontal size={20} strokeWidth={2} />
            {hasActiveFilters && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00a884] border border-[#f0f2f5]" />
            )}
          </button>
        </div>
      </div>



      {/* ── Active Filters ── */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 py-2.5 flex flex-wrap gap-2 border-b border-[#e9edef] bg-white">
              {activeFilterList.map((f) => (
                <div
                  key={f.key}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#f0f2f5] border border-[#e9edef]"
                >
                  <span className="text-[10px] font-bold text-[#667781] uppercase tracking-wider">{f.label}</span>
                  <span className="text-[11px] font-medium text-[#111b21]">{f.value}</span>
                  <button
                    onClick={() => removeFilter(f.key)}
                    className="p-0.5 hover:bg-gray-300 rounded-full text-[#667781] transition-colors"
                  >
                    <X size={10} strokeWidth={3} />
                  </button>
                </div>
              ))}
              <button
                onClick={handleClearFilters}
                className="text-[10px] font-bold text-[#008069] hover:bg-[#f0f2f5] px-2 py-1 rounded uppercase tracking-wider transition-colors"
              >
                Clear All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filter Panel ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden flex-shrink-0"
            style={{ borderBottom: "1px solid #e9edef", background: "#f0f2f5" }}
          >
            <div className="p-4 space-y-3">
              {/* Phone */}
              <div>
                <label className="text-[10px] font-semibold mb-1 block" style={{ color: "#667781" }}>
                  PHONE NUMBER
                </label>
                <input
                  type="text"
                  value={filters.number}
                  onChange={(e) => setFilters({ ...filters, number: e.target.value })}
                  placeholder="e.g. 9664838362"
                  className="w-full text-xs px-3 py-2 rounded-lg focus:outline-none"
                  style={{
                    background: "#fff",
                    border: "1px solid #e9edef",
                    color: "#111b21",
                  }}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold mb-1 block" style={{ color: "#667781" }}>
                    FROM DATE
                  </label>
                  <input
                    type="date"
                    value={filters.from_date}
                    onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
                    className="w-full text-xs px-2.5 py-2 rounded-lg focus:outline-none"
                    style={{ background: "#fff", border: "1px solid #e9edef", color: "#111b21" }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold mb-1 block" style={{ color: "#667781" }}>
                    TO DATE
                  </label>
                  <input
                    type="date"
                    value={filters.to_date}
                    onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
                    className="w-full text-xs px-2.5 py-2 rounded-lg focus:outline-none"
                    style={{ background: "#fff", border: "1px solid #e9edef", color: "#111b21" }}
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-[10px] font-semibold mb-1 block" style={{ color: "#667781" }}>
                  STATUS
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg focus:outline-none appearance-none"
                  style={{ background: "#fff", border: "1px solid #e9edef", color: "#111b21" }}
                >
                  <option value="">All Statuses</option>
                  {Object.entries(statusConfig).map(([val, cfg]) => (
                    <option key={val} value={val}>{cfg.label}</option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{ background: "#e9edef", color: "#667781" }}
                >
                  Clear
                </button>
                <button
                  onClick={handleApplyFilters}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50"
                  style={{ background: "#008069" }}
                >
                  <Search size={12} />
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden flex-shrink-0"
          >
            <div className="mx-3 mt-2 flex items-start gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
              <AlertCircle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Conversation List ── */}
      <div className="flex-1 overflow-y-auto" style={{ background: "#fff" }}>
        {isLoading && customers.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 size={22} className="animate-spin" style={{ color: "#008069" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2" style={{ color: "#667781" }}>
            <MessageCircle size={32} className="opacity-20" />
            <p className="text-xs font-medium">
              {searchText ? "No results found" : "No conversations yet"}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((c, i) => {
              const active = selectedCustomer?.customer_id === c.customer_id;
              const st = getStatus(c.status);
              const dname = getDisplayName(c.name, c.phone);
              const phoneOnly = dname.startsWith("+");
              const pal = getPalette(c.customer_id);

              return (
                <motion.button
                  key={c.customer_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.03, 0.2) }}
                  onClick={() => handleSelect(c)}
                  className="relative w-full text-left flex items-center gap-3 px-3 py-3 transition-colors duration-100"
                  style={{
                    background: active ? "#f0f2f5" : "transparent",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#f5f6f6"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold select-none"
                    style={{ background: pal.bg, color: pal.text }}
                  >
                    {getInitials(c.name, c.phone)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span
                        className={`leading-tight truncate font-medium ${phoneOnly ? "text-xs font-mono" : "text-sm"}`}
                        style={{ color: active ? "#008069" : "#111b21" }}
                      >
                        {dname}
                      </span>
                      <span className="text-[11px] flex-shrink-0 tabular-nums" style={{ color: active ? "#008069" : "#667781" }}>
                        {formatDate(c.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {/* Status badge */}
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${st.bg} ${st.text} ${st.border} flex-shrink-0`}
                        >
                          {st.label}
                        </span>
                        {!phoneOnly && (
                          <span className="text-[11px] truncate font-mono" style={{ color: "#667781" }}>
                            +{stripPlus(c.phone)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* ── Pagination ── */}
      {(pagination.next || pagination.previous) && (
        <div
          className="px-4 py-2.5 flex items-center justify-between flex-shrink-0"
          style={{ borderTop: "1px solid #e9edef", background: "#f0f2f5" }}
        >
          <button
            onClick={() => pagination.previous && dispatch(fetchCustomers(pagination.previous))}
            disabled={!pagination.previous || isLoading}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            style={{ color: "#008069" }}
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="text-[11px] tabular-nums" style={{ color: "#667781" }}>
            {customers.length} of {pagination.count?.toLocaleString()}
          </span>
          <button
            onClick={() => pagination.next && dispatch(fetchCustomers(pagination.next))}
            disabled={!pagination.next || isLoading}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            style={{ color: "#008069" }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default WhatsappSidebar;