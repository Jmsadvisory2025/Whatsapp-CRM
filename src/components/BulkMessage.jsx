import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomers, sendBulkMessage } from "../store/whatsappSlice";
import {
  X,
  Send,
  Loader2,
  Search,
  CheckSquare,
  Square,
  Users,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Helpers ─────────────────────────────────────────────── */

const stripPlus = (str) => String(str ?? "").replace(/^\+/, "");

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

/* ─── Component ──────────────────────────────────────────── */

const BulkMessage = ({ onClose }) => {
  const dispatch = useDispatch();
  const { customers, isLoading, pagination } = useSelector((s) => s.whatsapp);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [message, setMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // API-level filters (same as WhatsappSidebar)
  const [filters, setFilters] = useState({
    number: "",
    from_date: "",
    to_date: "",
    status: "",
  });

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const hasActiveFilters =
    filters.number || filters.from_date || filters.to_date || filters.status;

  const handleApplyFilters = () => {
    dispatch(fetchCustomers({ filters }));
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({ number: "", from_date: "", to_date: "", status: "" });
    dispatch(fetchCustomers());
    setShowFilters(false);
  };

  const removeFilter = (key) => {
    const newFilters = { ...filters, [key]: "" };
    setFilters(newFilters);
    dispatch(fetchCustomers({ filters: newFilters }));
  };

  const activeFilterList = [];
  if (filters.number) activeFilterList.push({ key: "number", label: "Phone", value: filters.number });
  if (filters.status) activeFilterList.push({ key: "status", label: "Status", value: getStatus(filters.status).label });
  if (filters.from_date) activeFilterList.push({ key: "from_date", label: "From", value: filters.from_date });
  if (filters.to_date) activeFilterList.push({ key: "to_date", label: "To", value: filters.to_date });

  // Local search on current page results
  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        const name = (c.name ?? "").toLowerCase();
        const phone = stripPlus(c.phone).toLowerCase();
        if (!name.includes(q) && !phone.includes(q)) return false;
      }
      return true;
    });
  }, [customers, searchText]);

  // Select all / deselect all (only for visible filtered list)
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((c) => selectedIds.has(c.conversation_id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      const newSet = new Set(selectedIds);
      filtered.forEach((c) => newSet.delete(c.conversation_id));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      filtered.forEach((c) => newSet.add(c.conversation_id));
      setSelectedIds(newSet);
    }
  };

  const toggleSelect = (convId) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(convId)) {
      newSet.delete(convId);
    } else {
      newSet.add(convId);
    }
    setSelectedIds(newSet);
  };

  const handleSend = async () => {
    if (selectedIds.size === 0 || !message.trim()) return;
    setIsSending(true);
    setSendResult(null);
    try {
      await dispatch(
        sendBulkMessage({
          conversation_ids: Array.from(selectedIds),
          message: message.trim(),
        })
      ).unwrap();
      setSendResult({
        type: "success",
        text: `Bulk message sent successfully to ${selectedIds.size} conversation(s)!`,
      });
      setSelectedIds(new Set());
      setMessage("");
    } catch (err) {
      setSendResult({ type: "error", text: err || "Failed to send bulk message" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: "#fff" }}>

      {/* ── Header with Filters ── */}
      <div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0 gap-3"
        style={{ background: "#f0f2f5", borderBottom: "1px solid #e9edef" }}
      >
        {/* Left: Title + selected count */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "#00a884" }}
          >
            <Users size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-[#111b21] leading-tight">Bulk Message</h2>
            {selectedIds.size > 0 && (
              <span className="text-[11px] font-semibold text-[#00a884] leading-tight">
                {selectedIds.size} contact(s) selected
              </span>
            )}
          </div>
          {selectedIds.size > 0 && (
            <span className="text-[11px] font-bold text-white px-2.5 py-0.5 rounded-full flex-shrink-0" style={{ background: "#00a884" }}>
              {selectedIds.size}
            </span>
          )}
        </div>

        {/* Right: Filters + Close */}
        <div className="flex items-end gap-2 flex-wrap">
          {/* Phone */}
          <div className="flex flex-col">
            <label className="text-[9px] font-bold text-[#667781] uppercase tracking-wider mb-0.5">Phone</label>
            <input
              type="text"
              value={filters.number}
              onChange={(e) => setFilters({ ...filters, number: e.target.value })}
              placeholder="Number..."
              className="text-[11px] px-2 py-1 rounded-md focus:outline-none w-[100px]"
              style={{ background: "#fff", border: "1px solid #e9edef", color: "#111b21" }}
            />
          </div>

          {/* From */}
          <div className="flex flex-col">
            <label className="text-[9px] font-bold text-[#667781] uppercase tracking-wider mb-0.5">From</label>
            <input
              type="date"
              value={filters.from_date}
              onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
              className="text-[11px] px-1.5 py-1 rounded-md focus:outline-none w-[120px]"
              style={{ background: "#fff", border: "1px solid #e9edef", color: "#111b21" }}
            />
          </div>

          {/* To */}
          <div className="flex flex-col">
            <label className="text-[9px] font-bold text-[#667781] uppercase tracking-wider mb-0.5">To</label>
            <input
              type="date"
              value={filters.to_date}
              onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
              className="text-[11px] px-1.5 py-1 rounded-md focus:outline-none w-[120px]"
              style={{ background: "#fff", border: "1px solid #e9edef", color: "#111b21" }}
            />
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-[9px] font-bold text-[#667781] uppercase tracking-wider mb-0.5">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="text-[11px] px-1.5 py-1 rounded-md focus:outline-none appearance-none w-[95px]"
              style={{ background: "#fff", border: "1px solid #e9edef", color: "#111b21" }}
            >
              <option value="">All</option>
              {Object.entries(statusConfig).map(([val, cfg]) => (
                <option key={val} value={val}>{cfg.label}</option>
              ))}
            </select>
          </div>

          {/* Apply */}
          <button
            onClick={handleApplyFilters}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-semibold text-white transition-colors disabled:opacity-50"
            style={{ background: "#008069" }}
          >
            {isLoading ? <Loader2 size={11} className="animate-spin" /> : <Search size={11} />}
            Apply
          </button>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors"
              style={{ background: "#e9edef", color: "#667781" }}
            >
              Clear
            </button>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 transition-colors text-[#54656f] ml-1"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Select All Bar ── */}
      <div
        className="px-4 py-1.5 flex items-center justify-between flex-shrink-0"
        style={{ background: "#f9fafb", borderBottom: "1px solid #e9edef" }}
      >
        <button
          onClick={toggleSelectAll}
          className="flex items-center gap-2 text-[12px] font-medium text-[#111b21] hover:text-[#00a884] transition-colors"
        >
          {allFilteredSelected ? (
            <CheckSquare size={16} className="text-[#00a884]" />
          ) : (
            <Square size={16} className="text-[#667781]" />
          )}
          {allFilteredSelected ? "Deselect All" : "Select All"}{" "}
          <span className="text-[#667781] font-normal">({filtered.length})</span>
        </button>

        {selectedIds.size > 0 && (
          <span className="text-[10px] font-semibold text-[#00a884] bg-[#e7faf0] px-2 py-0.5 rounded-full">
            Total selected: {selectedIds.size}
          </span>
        )}
      </div>

      {/* ── Contact List ── */}
      <div className="flex-1 overflow-y-auto p-3" style={{ background: "#fff" }}>
        {isLoading && customers.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 size={22} className="animate-spin text-[#00a884]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-[#667781]">
            <Users size={32} className="opacity-20" />
            <p className="text-xs font-medium">
              {hasActiveFilters ? "No results match your filters" : "No contacts found"}
            </p>
          </div>
        ) : (
          <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
            {filtered.map((c) => {
              const isSelected = selectedIds.has(c.conversation_id);
              const st = getStatus(c.status);
              const displayName =
                c.name && c.name !== c.phone && !/^\d+$/.test(c.name)
                  ? c.name
                  : `+${stripPlus(c.phone)}`;

              return (
                <button
                  key={c.customer_id}
                  onClick={() => toggleSelect(c.conversation_id)}
                  className={`flex items-center gap-2 pl-2 pr-3 py-2 rounded-lg border text-left transition-all duration-100 ${
                    isSelected
                      ? "bg-[#e7faf0] border-[#00a884] shadow-sm"
                      : "bg-white border-[#e9edef] hover:bg-[#f5f6f6] hover:border-[#d1d7db]"
                  }`}
                >
                  {/* Checkbox */}
                  <div className="flex-shrink-0">
                    {isSelected ? (
                      <CheckSquare size={16} className="text-[#00a884]" />
                    ) : (
                      <Square size={16} className="text-[#c4ccd0]" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-medium text-[#111b21] truncate leading-tight">
                        {displayName}
                      </span>
                      <span
                        className={`text-[9px] font-semibold px-1 py-0.5 rounded border flex-shrink-0 leading-none ${st.bg} ${st.text} ${st.border}`}
                      >
                        {st.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#667781] leading-tight">
                      +{stripPlus(c.phone)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Bottom Bar (Pagination + Message + Send — all compact) ── */}
      <div
        className="flex-shrink-0"
        style={{ background: "#f0f2f5", borderTop: "1px solid #e9edef" }}
      >
        {/* Pagination */}
        {(pagination.next || pagination.previous) && (
          <div className="px-4 py-1.5 flex items-center justify-between" style={{ borderBottom: "1px solid #e9edef" }}>
            <button
              onClick={() => pagination.previous && dispatch(fetchCustomers(pagination.previous))}
              disabled={!pagination.previous || isLoading}
              className="flex items-center gap-0.5 text-[11px] font-medium px-2 py-1 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              style={{ color: "#008069" }}
            >
              <ChevronLeft size={13} /> Prev
            </button>
            <span className="text-[10px] tabular-nums" style={{ color: "#667781" }}>
              {customers.length} of {pagination.count?.toLocaleString()}
            </span>
            <button
              onClick={() => pagination.next && dispatch(fetchCustomers(pagination.next))}
              disabled={!pagination.next || isLoading}
              className="flex items-center gap-0.5 text-[11px] font-medium px-2 py-1 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              style={{ color: "#008069" }}
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        )}

        {/* Result Toast */}
        <AnimatePresence>
          {sendResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`mx-4 mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium ${
                sendResult.type === "success"
                  ? "bg-[#e7faf0] text-[#00a884] border border-[#b2e5d0]"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}
            >
              {sendResult.type === "success" ? (
                <CheckCircle2 size={14} />
              ) : (
                <AlertCircle size={14} />
              )}
              <span className="flex-1">{sendResult.text}</span>
              <button onClick={() => setSendResult(null)} className="hover:opacity-70">
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message + Send */}
        <div className="px-4 py-2 flex items-end gap-2">
          <div className="flex-1 rounded-lg bg-white border border-gray-200 shadow-sm overflow-hidden focus-within:border-gray-300 transition-colors">
            <textarea
              rows={2}
              placeholder="Type your bulk message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSending}
              className="w-full resize-none bg-transparent text-[13px] text-[#111b21] placeholder-[#667781] focus:outline-none px-3 py-2 leading-relaxed disabled:opacity-50"
              style={{ minHeight: "48px", maxHeight: "100px" }}
            />
          </div>
          <div className="flex flex-col items-end gap-1 mb-0.5">
            <button
              onClick={handleSend}
              disabled={isSending || selectedIds.size === 0 || !message.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              style={{ background: "#00a884" }}
            >
              {isSending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Send ({selectedIds.size})
                </>
              )}
            </button>
            <span className="text-[9px] text-[#667781]">
              {selectedIds.size > 0 ? `${selectedIds.size} contact(s)` : "No selection"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkMessage;