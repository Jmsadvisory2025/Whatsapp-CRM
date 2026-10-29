import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomers,
  setSelectedCustomer,
  fetchConversationMessages,
} from "../store/whatsappSlice";
import axios from "axios";
import {
  MessageCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Status config ──────────────────────────────────────────────────────── */

const statusConfig = {
  prospect:  { label: "Prospect",  text: "text-[#8B5CF6]", bg: "bg-purple-50", border: "border-purple-200/70" },
  confirmed: { label: "Lead",      text: "text-[#0EA5E9]", bg: "bg-sky-50",    border: "border-sky-200/70"    },
  lead:      { label: "Lead",      text: "text-[#0EA5E9]", bg: "bg-sky-50",    border: "border-sky-200/70"    },
};

const getStatus = (key) =>
  statusConfig[key?.toLowerCase?.()] ?? {
    label: key ?? "Unknown",
    text: "text-[#64748B]",
    bg: "bg-slate-100",
    border: "border-slate-200",
  };

const PALETTES = [
  { bg: "#EFF6FF", text: "#165DFF", border: "#DBEAFE" },
  { bg: "#ECFDF5", text: "#059669", border: "#D1FAE5" },
  { bg: "#F5F3FF", text: "#7C3AED", border: "#EDE9FE" },
  { bg: "#F0F9FF", text: "#0284C7", border: "#E0F2FE" },
  { bg: "#FFFBEB", text: "#D97706", border: "#FEF3C7" },
  { bg: "#EEF2FF", text: "#4F46E5", border: "#E0E7FF" },
];
const getPalette = (id) => PALETTES[Number(id || 0) % PALETTES.length];

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

const getISTDateKey = (ts) =>
  new Date(ts).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();

  const dateKey = getISTDateKey(date);
  const todayKey = getISTDateKey(now);

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = getISTDateKey(yesterday);

  if (dateKey === todayKey) {
    return date.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  if (dateKey === yesterdayKey) return "Yesterday";

  return date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
  });
};

/* ─── Component ──────────────────────────────────────────────────────────── */

const WhatsappSidebar = ({
  filters = { number: "", from_date: "", to_date: "", status: "" },
  hasActiveFilters = false,
  onClearFilters,
  onSelectCustomer,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth || {});
  const isTp = user?.user_type === "tech_provider";

  const {
    customers,
    selectedCustomer,
    isLoading,
    error,
    pagination,
    wabaPhone,
  } = useSelector((s) => s.whatsapp);

  const [searchText, setSearchText] = useState("");

  // ── Fetch on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const hasAutoSelected = React.useRef(false);

  // ── Auto-select first conversation when list loads ─────────────────────────
  useEffect(() => {
    const autoSelect = async () => {
      if (!selectedCustomer && customers.length > 0 && !hasAutoSelected.current) {
        hasAutoSelected.current = true;
        const first = customers[0];
        let convId = first.conversation_id;

        if (!convId && isTp && first.phone) {
          try {
            const token = localStorage.getItem("accessToken");
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
            const res = await axios.get(`${API_BASE_URL}api/industry/conversations/`, {
              headers: { Authorization: `Bearer ${token}` },
              params: { phone: first.phone, page_size: 1 },
            });
            if (res.data && res.data.results && res.data.results.length > 0) {
              convId = res.data.results[0].id;
            }
          } catch (err) {
            console.error("Failed to fetch conversation ID for TP", err);
          }
        }

        const updatedCustomer = {
          ...first,
          customer_id: first.customer_id || first.id,
          conversation_id: convId || first.conversation_id,
        };

        dispatch(setSelectedCustomer(updatedCustomer));
        if (convId) {
          dispatch(fetchConversationMessages(convId));
        }
      }
    };
    autoSelect();
  }, [customers, selectedCustomer, dispatch, isTp]);

  const handleSelect = async (customer) => {
    let convId = customer.conversation_id;

    if (!convId && isTp && customer.phone) {
      try {
        const token = localStorage.getItem("accessToken");
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const res = await axios.get(`${API_BASE_URL}api/industry/conversations/`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { phone: customer.phone, page_size: 1 },
        });
        if (res.data && res.data.results && res.data.results.length > 0) {
          convId = res.data.results[0].id;
        }
      } catch (err) {
        console.error("Failed to fetch conversation ID for TP", err);
      }
    }

    const updatedCustomer = {
      ...customer,
      customer_id: customer.customer_id || customer.id,
      conversation_id: convId || customer.conversation_id,
    };

    dispatch(setSelectedCustomer(updatedCustomer));
    if (convId) {
      dispatch(fetchConversationMessages(convId));
    }
    onSelectCustomer?.();
  };

  // ── Client-side search ─────────────────────────────────────────────────────
  const filtered = searchText.trim()
    ? customers.filter((c) => {
        const q = searchText.toLowerCase();
        return (
          (c.name || "").toLowerCase().includes(q) ||
          (c.phone || "").toLowerCase().includes(q)
        );
      })
    : customers;

  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-white font-sans text-[#172033]">
      {/* ── Clean Sidebar Header (Title + Search Only) ── */}
      <div className="flex-shrink-0 px-4 pt-3.5 pb-3 border-b border-slate-100 bg-white space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-sm font-bold text-[#172033] tracking-tight leading-tight">
              Conversations
            </h2>
            {pagination?.count > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#165DFF] border border-blue-100 tabular-nums">
                {pagination.count}
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-[11px] font-semibold text-[#165DFF] hover:text-[#1247CC] transition-colors cursor-pointer"
            >
              Reset filter
            </button>
          )}
        </div>

        {/* Quick Search Bar */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />
          <input
            type="text"
            placeholder="Search name or phone..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-8 pr-7 py-2 text-xs bg-slate-50/80 focus:bg-white rounded-xl border border-[#E5E7EB] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/10 text-[#172033] placeholder:text-[#94A3B8] outline-none transition-all"
          />
          {searchText && (
            <button
              onClick={() => setSearchText("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#172033] cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden flex-shrink-0"
          >
            <div className="mx-3 mt-2 flex items-start gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Conversation List ── */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100/80 bg-white">
        {isLoading && customers.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 size={20} className="animate-spin text-[#165DFF]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-[#64748B] px-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-center">
              <MessageCircle size={20} className="text-[#165DFF]/60" />
            </div>
            <p className="text-xs font-semibold text-[#172033] mt-1">
              {searchText
                ? "No results found"
                : hasActiveFilters
                  ? "No conversations match your filters"
                  : "No conversations yet"}
            </p>
            {!searchText && wabaPhone && !hasActiveFilters && (
              <p className="text-[11px] text-center text-[#94A3B8]">
                Waiting for messages on +{stripPlus(wabaPhone)}
              </p>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((c, i) => {
              const cId = c.customer_id || c.id;
              const active =
                selectedCustomer && (selectedCustomer.customer_id || selectedCustomer.id) === cId;
              const st = getStatus(c.status);
              const dname = getDisplayName(c.name, c.phone);
              const phoneOnly = dname.startsWith("+");
              const pal = getPalette(cId);

              return (
                <motion.button
                  key={cId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.15) }}
                  onClick={() => handleSelect(c)}
                  className={`relative w-full text-left flex items-center gap-3 px-3.5 py-3 transition-colors duration-150 cursor-pointer ${
                    active ? "bg-blue-50/60" : "hover:bg-slate-50/80"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-semibold select-none border"
                    style={{
                      background: pal.bg,
                      color: pal.text,
                      borderColor: pal.border,
                    }}
                  >
                    {getInitials(c.name, c.phone)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`leading-tight truncate font-semibold text-xs ${
                          active ? "text-[#165DFF]" : "text-[#172033]"
                        }`}
                        title={dname}
                      >
                        {dname}
                      </span>
                      <span
                        className={`text-[10px] flex-shrink-0 tabular-nums font-medium ${
                          active ? "text-[#165DFF]" : "text-[#94A3B8]"
                        }`}
                      >
                        {formatDate(c.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${st.bg} ${st.text} ${st.border} flex-shrink-0`}
                        >
                          {st.label}
                        </span>
                        {!phoneOnly && (
                          <span className="text-[11px] truncate text-[#64748B]">
                            +{stripPlus(c.phone)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-[#165DFF]" />
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* ── Pagination ── */}
      {pagination.totalPages > 1 && (
        <div className="px-3.5 py-2.5 flex items-center justify-between flex-shrink-0 border-t border-slate-100 bg-slate-50/60">
          <button
            onClick={() => {
              const p = pagination.currentPage - 1;
              dispatch(fetchCustomers({ filters, page: p }));
            }}
            disabled={pagination.currentPage <= 1 || isLoading}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#172033] hover:border-[#165DFF]/40 hover:text-[#165DFF] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronLeft size={13} /> Prev
          </button>

          <span className="text-[11px] font-medium text-[#64748B] tabular-nums">
            {(pagination.currentPage - 1) * pagination.pageSize + 1}–
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.count)} of{" "}
            <strong className="text-[#172033] font-semibold">
              {pagination.count?.toLocaleString()}
            </strong>
          </span>

          <button
            onClick={() => {
              const p = pagination.currentPage + 1;
              dispatch(fetchCustomers({ filters, page: p }));
            }}
            disabled={pagination.currentPage >= pagination.totalPages || isLoading}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#172033] hover:border-[#165DFF]/40 hover:text-[#165DFF] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            Next <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
};

export default WhatsappSidebar;
