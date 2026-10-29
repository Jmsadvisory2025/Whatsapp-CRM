import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSelectedCustomer, fetchConversationMessages } from "../store/whatsappSlice";
import ChatArea from "../components/ChatArea";
import { createPortal } from "react-dom";

import {
  User,
  Phone,
  CheckCircle2,
  Clock3,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
} from "lucide-react";

import Card from "../components/ui/Card";
import { isTechProvider } from "../store/authUtils";
import LoaderDemo from "../components/ui/ProfessionalMedicalLoader ";

const API = import.meta.env.VITE_API_BASE_URL;

const LeadsProspects = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [globalCounts, setGlobalCounts] = useState({ all: 0, lead: 0, prospect: 0 });
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const userEmail = localStorage.getItem("ownerEmail") || "";
  const isTp = isTechProvider(userEmail);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem("accessToken");
      let res;
      if (isTp) {
        res = await axios.get(`${API}api/industry/customers/`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { search, page: 1, page_size: 99999, ...(activeTab !== "all" && { status: activeTab }) },
        });
      } else {
        res = await axios.get(`${API}/api/leads-prospects/`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { tab: activeTab, search, page: 1, page_size: 99999 },
        });
      }

      const exportData = res.data.results || [];
      const headers = ["Customer", "Phone", "Status", "Stage", "Last Chat"];

      const csvRows = [headers.join(",")];

      exportData.forEach((item) => {
        const customer = `"${(item.name || "Unknown").replace(/"/g, '""')}"`;
        const phone = `"=""${item.phone || ""}"""`;
        const status = `"${(item.status || "prospect").replace(/"/g, '""')}"`;

        let stage = '""';
        if (isTp) {
          stage = `"${(item.bot_source || "unknown").replace(/"/g, '""')}"`;
        } else {
          stage = `"${(item.chatbot_stage || "").replace(/"/g, '""')}"`;
        }

        const dateStr = item.last_seen || item.last_chat || item.created_at || "";
        let formattedDate = "";
        if (dateStr) {
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
          } else {
            formattedDate = dateStr;
          }
        }
        const lastChat = `"${formattedDate.replace(/"/g, '""')}"`;

        csvRows.push([customer, phone, status, stage, lastChat].join(","));
      });

      const csvString = csvRows.join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `JMS_${activeTab}_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to export data.");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePhoneClick = async (item) => {
    if (item.conversation_id || item.phone) {
      let convId = item.conversation_id;

      if (!convId && isTp && item.phone) {
        try {
          const token = localStorage.getItem("accessToken");
          const res = await axios.get(`${API}api/industry/conversations/`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { phone: item.phone, page_size: 1 },
          });
          if (res.data && res.data.results && res.data.results.length > 0) {
            convId = res.data.results[0].id;
          }
        } catch (err) {
          console.error("Failed to fetch conversation ID for TP", err);
        }
      }

      if (convId) {
        dispatch(
          setSelectedCustomer({
            ...item,
            customer_id: item.id,
            conversation_id: convId,
          })
        );
        dispatch(fetchConversationMessages(convId));
      } else {
        dispatch(
          setSelectedCustomer({
            ...item,
            customer_id: item.id,
          })
        );
      }
      setIsChatModalOpen(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, search, page]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      let res;

      if (isTp) {
        res = await axios.get(`${API}api/industry/customers/`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            search,
            page,
            page_size: 20,
            ...(activeTab !== "all" && { status: activeTab }),
          },
        });

        setGlobalCounts({
          all: res.data.total_count || 0,
          lead: res.data.lead_count || 0,
          prospect: res.data.prospect_count || 0,
        });

        const mapped = (res.data.results || []).map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          status: c.status || "prospect",
          chatbot_stage: null,
          message_count: c.total_messages,
          last_chat: c.last_seen,
          conversation_id: null,
          bot_source: c.bot_source || "unknown",
        }));
        setData(mapped);
        setCount(res.data.count || 0);
      } else {
        res = await axios.get(`${API}/api/leads-prospects/`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { tab: activeTab, search, page, page_size: 20 },
        });

        setGlobalCounts({
          all: res.data.total_count || 0,
          lead: res.data.lead_count || 0,
          prospect: res.data.prospect_count || 0,
        });

        setData(res.data.results || []);
        setCount(res.data.count || 0);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load data");
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const totalPages = Math.ceil(count / 20);

  const displayData = isTp
    ? data
    : activeTab === "all"
      ? data
      : data.filter((item) => item.status === activeTab);

  /* -------------------------------------------------------------------------- */
  /*                                   LOADING                                  */
  /* -------------------------------------------------------------------------- */

  if (isInitialLoad) {
    return <LoaderDemo />;
  }

  /* -------------------------------------------------------------------------- */
  /*                                    ERROR                                   */
  /* -------------------------------------------------------------------------- */

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFC] p-5 sm:p-6 lg:p-7 font-sans text-[#172033]">
        <Card className="bg-white border border-red-100 rounded-2xl shadow-sm shadow-blue-500/[0.03]">
          <div className="p-5 flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="text-red-500" size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172033] tracking-tight">
                Something went wrong
              </h2>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                {error}
              </p>
              <button
                onClick={fetchData}
                className="mt-3.5 px-4 py-2 rounded-xl bg-[#165DFF] hover:bg-[#1247CC] text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FAFAFC] p-5 sm:p-6 lg:p-7 space-y-5 font-sans text-[#172033]">

      {/* ---------------------------------------------------------------------- */}
      {/* HEADER (Matching WhatsApp Page Header)                                 */}
      {/* ---------------------------------------------------------------------- */}

      <div className="flex items-center justify-between flex-wrap gap-3 pb-3.5 min-h-[56px] border-b border-[#E5E7EB]/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#172033] leading-tight">
            Customers
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-normal">
            Manage customer contacts, leads, and prospects in one place.
          </p>
        </div>

        {/* Right Toolbar: All / Leads / Prospects Segmented Tabs + Export + Refresh */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="h-9 flex items-center bg-white p-1 rounded-xl border border-[#E5E7EB] shadow-2xs">
            {[
              { key: "all", label: `All (${globalCounts.all})` },
              { key: "lead", label: `Leads (${globalCounts.lead})`, dot: "bg-[#0EA5E9]" },
              { key: "prospect", label: `Prospects (${globalCounts.prospect})`, dot: "bg-[#8B5CF6]" },
            ].map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setPage(1);
                  }}
                  className={`h-full flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="h-9 flex items-center justify-center gap-1.5 px-3.5 bg-white border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#172033] hover:border-[#165DFF]/40 hover:text-[#165DFF] hover:bg-blue-50/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs whitespace-nowrap cursor-pointer"
            title="Export to CSV"
          >
            {isExporting ? (
              <Loader2 size={13} className="animate-spin text-[#165DFF]" />
            ) : (
              <Download size={13} className="text-[#64748B]" />
            )}
            <span>Export</span>
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            className="h-9 flex items-center gap-1.5 text-xs font-semibold px-3.5 bg-white border border-[#E5E7EB] rounded-xl text-[#172033] hover:border-[#165DFF]/40 hover:text-[#165DFF] hover:bg-blue-50/30 transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw
              size={13}
              className={
                loading && !isInitialLoad
                  ? "animate-spin text-[#165DFF]"
                  : "text-[#64748B]"
              }
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* TABLE CARD (Search bar at top-left matching WhatsApp Sidebar)          */}
      {/* ---------------------------------------------------------------------- */}

      <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-sm shadow-blue-500/[0.03] overflow-hidden">

        {/* Top Search Header inside Card (same left position as WhatsApp) */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            />
            <input
              type="text"
              placeholder="Search customer or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-7 py-2 text-xs bg-slate-50/80 focus:bg-white rounded-xl border border-[#E5E7EB] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/10 text-[#172033] placeholder:text-[#94A3B8] outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#172033] cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span className="font-semibold text-[#172033]">Records</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#165DFF] border border-blue-100 tabular-nums">
              {count}
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* DESKTOP TABLE                                                      */}
        {/* ------------------------------------------------------------------ */}

        <div className="hidden xl:block overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                {(isTp
                  ? [
                      { label: "Customer", width: "w-[20%]" },
                      { label: "Phone", width: "w-[20%]" },
                      { label: "Bot", width: "w-[22%]" },
                      { label: "Status", width: "w-[18%]" },
                      { label: "Last Chat", width: "w-[20%]" },
                    ]
                  : [
                      { label: "Customer", width: "w-[20%]" },
                      { label: "Phone", width: "w-[20%]" },
                      { label: "Status", width: "w-[18%]" },
                      { label: "Stage", width: "w-[22%]" },
                      { label: "Last Chat", width: "w-[20%]" },
                    ]
                ).map((col, i) => (
                  <th
                    key={i}
                    className={`${col.width} px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748B] text-left truncate`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {displayData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-center mx-auto">
                      <User size={22} className="text-[#165DFF]/60" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#172033] mt-3">
                      No records found
                    </h3>
                    <p className="text-xs text-[#64748B] mt-1">
                      Try changing search or filters
                    </p>
                  </td>
                </tr>
              ) : (
                displayData.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors duration-150 hover:bg-blue-50/25 cursor-default"
                  >
                    {/* Customer */}
                    <td className="px-5 py-3.5 overflow-hidden">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center flex-shrink-0">
                          <User size={15} className="text-[#165DFF]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-xs font-semibold text-[#172033] truncate"
                            title={item.name || "Unknown"}
                          >
                            {item.name || "Unknown"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-5 py-3.5 overflow-hidden">
                      <div
                        onClick={() => handlePhoneClick(item)}
                        title={
                          item.conversation_id || item.phone
                            ? `Open WhatsApp chat with ${item.phone}`
                            : item.phone
                        }
                        className={`group inline-flex items-center gap-1.5 text-xs max-w-full ${
                          item.conversation_id || item.phone
                            ? "cursor-pointer text-[#165DFF] hover:text-[#1247CC] font-semibold transition-colors"
                            : "text-[#64748B]"
                        }`}
                      >
                        <Phone size={13} className="text-[#165DFF] flex-shrink-0" />
                        <span className="truncate group-hover:underline underline-offset-4 decoration-[#165DFF]/60">
                          {item.phone}
                        </span>
                      </div>
                    </td>

                    {/* Bot Source */}
                    {isTp && (
                      <td className="px-5 py-3.5 overflow-hidden">
                        {{
                          industry: (
                            <span className="inline-flex items-center max-w-full truncate px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200/80">
                              Industry Bot
                            </span>
                          ),
                          jms: (
                            <span className="inline-flex items-center max-w-full truncate px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              JMS Bot
                            </span>
                          ),
                          whatsapp: (
                            <span className="inline-flex items-center max-w-full truncate px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-blue-50 text-[#165DFF] border border-blue-200/80">
                              Meta Bot
                            </span>
                          ),
                          mutual_funds: (
                            <span className="inline-flex items-center max-w-full truncate px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                              Mutual Funds Bot
                            </span>
                          ),
                          hotel: (
                            <span className="inline-flex items-center max-w-full truncate px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
                              Service Bot
                            </span>
                          ),
                          service: (
                            <span className="inline-flex items-center max-w-full truncate px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
                              Service Bot
                            </span>
                          ),
                          mody: (
                            <span className="inline-flex items-center max-w-full truncate px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-red-50 text-red-700 border border-red-200/80">
                              Mody Toyota Bot
                            </span>
                          ),
                        }[item.bot_source] || <span className="text-xs text-[#94A3B8]">—</span>}
                      </td>
                    )}

                    {/* Status */}
                    <td className="px-5 py-3.5 overflow-hidden">
                      {item.status === "lead" ? (
                        <span className="inline-flex items-center gap-1 max-w-full truncate px-2.5 py-1 rounded-lg bg-sky-50 text-[#0EA5E9] border border-sky-200/70 text-[11px] font-semibold">
                          <CheckCircle2 size={12} className="flex-shrink-0" />
                          <span className="truncate">Lead</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 max-w-full truncate px-2.5 py-1 rounded-lg bg-purple-50 text-[#8B5CF6] border border-purple-200/70 text-[11px] font-semibold">
                          <Clock3 size={12} className="flex-shrink-0" />
                          <span className="truncate">Prospect</span>
                        </span>
                      )}
                    </td>

                    {/* Stage */}
                    {!isTp && (
                      <td className="px-5 py-3.5 overflow-hidden">
                        <p
                          className="text-xs text-[#64748B] capitalize truncate"
                          title={item.chatbot_stage || "N/A"}
                        >
                          {item.chatbot_stage || "N/A"}
                        </p>
                      </td>
                    )}

                    {/* Last Chat */}
                    <td className="px-5 py-3.5 overflow-hidden">
                      <p className="text-xs text-[#64748B] truncate">
                        {item.last_chat
                          ? new Date(item.last_chat).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "N/A"}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* MOBILE CARDS                                                       */}
        {/* ------------------------------------------------------------------ */}

        <div className="xl:hidden p-4 space-y-3">
          {displayData.length === 0 ? (
            <div className="py-14 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-center mx-auto">
                <User size={22} className="text-[#165DFF]/60" />
              </div>
              <h3 className="text-sm font-semibold text-[#172033] mt-3">
                No records found
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                Try changing filters
              </p>
            </div>
          ) : (
            displayData.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200/80 rounded-2xl p-4 transition-all cursor-default hover:border-[#165DFF]/30 bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center flex-shrink-0">
                      <User size={15} className="text-[#165DFF]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className="text-xs font-semibold text-[#172033] truncate"
                        title={item.name || "Unknown"}
                      >
                        {item.name || "Unknown"}
                      </h3>
                      <div
                        onClick={() => handlePhoneClick(item)}
                        className="group inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#165DFF] hover:text-[#1247CC] mt-0.5 cursor-pointer transition-colors max-w-full truncate"
                      >
                        <Phone size={11} className="flex-shrink-0 text-[#165DFF]" />
                        <span className="truncate group-hover:underline underline-offset-2">
                          {item.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  {item.status === "lead" ? (
                    <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 text-[#0EA5E9] border border-sky-200/70 text-[11px] font-semibold flex-shrink-0">
                      Lead
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-lg bg-purple-50 text-[#8B5CF6] border border-purple-200/70 text-[11px] font-semibold flex-shrink-0">
                      Prospect
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3.5 pt-3 border-t border-slate-100">
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#94A3B8]">
                      Stage
                    </p>
                    <p
                      className="text-xs font-medium text-[#172033] mt-0.5 capitalize truncate"
                      title={item.chatbot_stage || "N/A"}
                    >
                      {item.chatbot_stage || "N/A"}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] text-[#94A3B8]">
                      Last Chat
                    </p>
                    <p className="text-xs font-medium text-[#172033] mt-0.5 truncate">
                      {item.last_chat
                        ? new Date(item.last_chat).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                            }
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* PAGINATION                                                         */}
        {/* ------------------------------------------------------------------ */}

        {count > 20 && (
          <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/60 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <p className="text-xs text-[#64748B]">
              Showing{" "}
              <span className="font-semibold text-[#172033]">
                {(page - 1) * 20 + 1}
              </span>
              -
              <span className="font-semibold text-[#172033]">
                {Math.min(page * 20, count)}
              </span>
              {" "}of{" "}
              <span className="font-semibold text-[#172033]">
                {count}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E7EB] bg-white text-xs font-medium text-[#172033] hover:border-[#165DFF]/40 hover:text-[#165DFF] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft size={14} />
                Previous
              </button>

              <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E7EB] text-xs font-semibold text-[#172033]">
                {page} / {totalPages}
              </div>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page * 20 >= count}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E7EB] bg-white text-xs font-medium text-[#172033] hover:border-[#165DFF]/40 hover:text-[#165DFF] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

      </Card>

      {isChatModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/20 backdrop-blur-md p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
            <div className="flex-1 relative overflow-hidden flex bg-[#FAFAFC]">
              <ChatArea onBack={() => setIsChatModalOpen(false)} />
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default LeadsProspects;
