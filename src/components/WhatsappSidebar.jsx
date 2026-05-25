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
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Status config ──────────────────────────────────────────────────────── */

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

/* ─── Helpers ────────────────────────────────────────────────────────────── */

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

/* ─── Component ──────────────────────────────────────────────────────────── */

const WhatsappSidebar = ({ onSelectCustomer }) => {
  const dispatch = useDispatch();
  const {
    customers,
    selectedCustomer,
    isLoading,
    error,
    pagination,
    wabaPhone,           // ← verified business number from Redux
  } = useSelector((s) => s.whatsapp);

  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText]   = useState("");
  const [filters, setFilters] = useState({
    number: "", from_date: "", to_date: "", status: "",
  });

  // ── Fetch on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  // ── Auto-select first conversation when list loads ─────────────────────────
  // This is the KEY FIX: jevi conversations load thay, pehli conversation
  // automatically select thay — user ne click karvani jaroor nahi.
  useEffect(() => {
    if (!selectedCustomer && customers.length > 0) {
      const first = customers[0];
      dispatch(setSelectedCustomer(first));
      dispatch(fetchConversationMessages(first.conversation_id));
    }
  }, [customers, selectedCustomer, dispatch]);

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
    onSelectCustomer?.();
  };

  // ── Client-side search ─────────────────────────────────────────────────────
  const filtered = searchText.trim()
    ? customers.filter((c) => {
        const q = searchText.toLowerCase();
        return (
          (c.name  || "").toLowerCase().includes(q) ||
          (c.phone || "").toLowerCase().includes(q)
        );
      })
    : customers;

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "#fff" }}>

      {/* ── Header ── */}
      <div
        className="flex-shrink-0 px-4 pt-3 pb-2"
        style={{ borderBottom: "1px solid #e9edef", background: "#f0f2f5" }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold" style={{ color: "#111b21" }}>
              Chats
            </span>

            {/* ── Verified number badge ── */}
            {wabaPhone && (
              <span
                className="flex items-center gap-1 text-[11px] font-medium mt-0.5"
                style={{ color: "#008069" }}
                title="WhatsApp Business verified number"
              >
                <CheckCircle2 size={11} />
                +{stripPlus(wabaPhone)}
              </span>
            )}
          </div>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`p-2 rounded-full transition-colors ${
              showFilters ? "bg-[#008069] text-white" : "hover:bg-gray-200 text-[#54656f]"
            }`}
            title="Filters"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* ── Search bar ── */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: "#fff", border: "1px solid #e9edef" }}
        >
          <Search size={14} style={{ color: "#667781" }} />
          <input
            type="text"
            placeholder="Search by name or number"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 text-sm bg-transparent focus:outline-none placeholder-[#667781]"
            style={{ color: "#111b21" }}
          />
          {searchText && (
            <button onClick={() => setSearchText("")} className="text-[#667781] hover:text-gray-700">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Filters panel ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden flex-shrink-0"
          >
            <div
              className="px-4 py-3 flex flex-col gap-2.5"
              style={{ background: "#f7f8fa", borderBottom: "1px solid #e9edef" }}
            >
              {/* Number */}
              <div>
                <label className="text-[10px] font-semibold mb-1 block" style={{ color: "#667781" }}>
                  PHONE NUMBER
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={filters.number}
                  onChange={(e) => setFilters({ ...filters, number: e.target.value })}
                  className="w-full text-xs px-2.5 py-2 rounded-lg focus:outline-none"
                  style={{ background: "#fff", border: "1px solid #e9edef", color: "#111b21" }}
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
            {!searchText && wabaPhone && (
              <p className="text-[10px] text-center px-6" style={{ color: "#aaa" }}>
                Waiting for messages on +{stripPlus(wabaPhone)}
              </p>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((c, i) => {
              const active  = selectedCustomer?.customer_id === c.customer_id;
              const st      = getStatus(c.status);
              const dname   = getDisplayName(c.name, c.phone);
              const phoneOnly = dname.startsWith("+");
              const pal     = getPalette(c.customer_id);

              return (
                <motion.button
                  key={c.customer_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.03, 0.2) }}
                  onClick={() => handleSelect(c)}
                  className="relative w-full text-left flex items-center gap-3 px-3 py-3 transition-colors duration-100"
                  style={{ background: active ? "#f0f2f5" : "transparent" }}
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

                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full" style={{ background: "#008069" }} />
                  )}
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