import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchTemplates } from "../store/templateSlice";
import {
  Send,
  CheckCircle2,
  Eye,
  MousePointerClick,
  Receipt,
  FileText,
  AlertCircle,
  Loader2,
  RefreshCw,
  Calendar,
  ChevronDown,
  Search,
  Check,
  X,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const DATE_RANGE_OPTIONS = [
  { label: "Last 7 Days", value: "7" },
  { label: "Last 30 Days", value: "30" },
  { label: "Last 60 Days", value: "60" },
  { label: "Last 90 Days", value: "88" },
  { label: "Custom Range", value: "custom" },
];

const METRIC_CONFIG = [
  { key: "sent", label: "Messages sent", color: "#6366F1", activeColor: "#4F46E5" },
  { key: "delivered", label: "Messages delivered", color: "#10B981", activeColor: "#059669" },
  { key: "read", label: "Messages read", color: "#8B5CF6", activeColor: "#7C3AED" },
  { key: "clicked", label: "Unique clicks", color: "#F59E0B", activeColor: "#D97706" },
];

const TemplateAnalytics = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const templateIdParam = searchParams.get("template_id");

  const { list: templates, isLoading: templatesLoading } = useSelector(
    (s) => s.templates
  );

  const [selectedTemplateId, setSelectedTemplateId] = useState(
    templateIdParam || ""
  );
  const [selectedRange, setSelectedRange] = useState("7");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Chart active series toggles
  const [activeSeries, setActiveSeries] = useState({
    sent: true,
    delivered: true,
    read: true,
    clicked: true,
  });

  // Custom searchable template dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const dropdownRef = useRef(null);

  // Custom date range dropdown state
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  const rangeRef = useRef(null);

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  const token =
    useSelector((state) => state.auth?.accessToken) ||
    localStorage.getItem("accessToken");
  const wabaId = useSelector((state) => state.metaConnect?.wabaId);
  const metaToken = import.meta.env.VITE_META_ACCESS_TOKEN;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    if (!templates || templates.length === 0) {
      dispatch(fetchTemplates());
    }
  }, [dispatch, templates]);

  // Set initial selected template once templates load, without resetting on state changes
  useEffect(() => {
    if (templateIdParam) {
      setSelectedTemplateId(templateIdParam);
    } else if (templates && templates.length > 0) {
      setSelectedTemplateId((prev) => {
        // If a template is already selected and exists in the list, preserve it!
        if (prev && templates.some((t) => String(t.template_id || t.id) === String(prev))) {
          return prev;
        }
        return templates[0].template_id || templates[0].id;
      });
    }
  }, [templates, templateIdParam]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (rangeRef.current && !rangeRef.current.contains(event.target)) {
        setIsRangeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeTemplate = useMemo(() => {
    return (
      templates.find(
        (t) =>
          String(t.template_id) === String(selectedTemplateId) ||
          String(t.id) === String(selectedTemplateId)
      ) || templates[0]
    );
  }, [templates, selectedTemplateId]);

  const activeRangeLabel = useMemo(() => {
    return (
      DATE_RANGE_OPTIONS.find((opt) => opt.value === selectedRange)?.label ||
      "Select Range"
    );
  }, [selectedRange]);

  const filteredTemplates = useMemo(() => {
    if (!templateSearch.trim()) return templates;
    const q = templateSearch.toLowerCase();
    return templates.filter((t) => (t.name || "").toLowerCase().includes(q));
  }, [templates, templateSearch]);

  const fetchAnalytics = async () => {
    if (!activeTemplate) return;
    if (selectedRange === "custom" && (!customStart || !customEnd)) return;

    setLoading(true);
    setError(null);
    setErrorDetails(null);

    try {
      const queryParams = new URLSearchParams();
      if (wabaId) queryParams.append("waba_id", wabaId);
      if (metaToken) queryParams.append("access_token", metaToken);

      if (activeTemplate.template_id) {
        queryParams.append("template_id", activeTemplate.template_id);
      } else {
        queryParams.append(
          "template_name",
          activeTemplate.template_name || activeTemplate.name || ""
        );
      }

      if (selectedRange === "custom") {
        if (customStart && customEnd) {
          const [sY, sM, sD] = customStart.split("-").map(Number);
          const [eY, eM, eD] = customEnd.split("-").map(Number);
          const startTimestamp = Math.floor(Date.UTC(sY, sM - 1, sD, 0, 0, 0) / 1000);
          const endTimestamp = Math.floor(Date.UTC(eY, eM - 1, eD, 23, 59, 59) / 1000);
          queryParams.append("start_date", startTimestamp);
          queryParams.append("end_date", endTimestamp);
        }
      } else {
        queryParams.append("days", selectedRange);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/templates/analytics/?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to fetch analytics");
        setErrorDetails(result.details || null);
        return;
      }

      setAnalyticsData(result.data);
    } catch (err) {
      setError(err.message || "Network or server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTemplate) {
      fetchAnalytics();
    }
  }, [
    activeTemplate?.template_id,
    activeTemplate?.name,
    selectedRange,
    customStart,
    customEnd,
  ]);

  // Aggregate stats and generate exact daily points matching Meta
  const { stats, chartData, buttonClicksList } = useMemo(() => {
    let totals = {
      sent: 0,
      delivered: 0,
      read: 0,
      clicked: 0,
      amount_spent: 0,
    };
    let buttonBreakdown = {};
    let dailyMap = {};

    // Calculate exact boundary date strings (YYYY-MM-DD) for local comparison
    let startDateLimit = null;
    let endDateLimit = null;

    if (selectedRange === "custom" && customStart && customEnd) {
      startDateLimit = customStart;
      endDateLimit = customEnd;
    } else {
      const daysCount = parseInt(selectedRange, 10) || 7;
      const today = new Date();
      endDateLimit = today.toISOString().split("T")[0];

      const past = new Date();
      // Last 7 days includes today + previous 6 days (e.g. Nov 2 - 6 = Oct 27)
      past.setDate(past.getDate() - (daysCount - 1));
      startDateLimit = past.toISOString().split("T")[0];
    }

    if (analyticsData?.template_analytics?.data?.[0]?.data_points) {
      const points = analyticsData.template_analytics.data[0].data_points;
      points.forEach((pt) => {
        if (!pt.start) return;

        // Meta timestamps: calculate date based on UTC to match Meta's daily bucket
        const ptDate = new Date(pt.start * 1000);
        const y = ptDate.getUTCFullYear();
        const m = String(ptDate.getUTCMonth() + 1).padStart(2, "0");
        const d = String(ptDate.getUTCDate()).padStart(2, "0");
        const ptDateStr = `${y}-${m}-${d}`;

        // Filter by date boundaries matching Meta's exact window
        if (startDateLimit && ptDateStr < startDateLimit) return;
        if (endDateLimit && ptDateStr > endDateLimit) return;

        const sentVal = pt.sent || 0;
        const deliveredVal = pt.delivered || 0;
        const readVal = pt.read || 0;

        totals.sent += sentVal;
        totals.delivered += deliveredVal;
        totals.read += readVal;

        // Meta Cost: Meta returns cost as an array of objects [ { type: "amount_spent", value: 12.34 } ]
        if (Array.isArray(pt.cost)) {
          pt.cost.forEach((c) => {
            if (c.type === "amount_spent" || !c.type) {
              totals.amount_spent += c.value || c.amount || 0;
            }
          });
        } else if (typeof pt.amount_spent === "number") {
          totals.amount_spent += pt.amount_spent;
        } else if (typeof pt.cost === "number") {
          totals.amount_spent += pt.cost;
        } else if (pt.cost && typeof pt.cost.value === "number") {
          totals.amount_spent += pt.cost.value;
        } else if (pt.cost && typeof pt.cost.amount === "number") {
          totals.amount_spent += pt.cost.amount;
        }

        let clickTotalForPoint = 0;
        if (Array.isArray(pt.clicked)) {
          pt.clicked.forEach((c) => {
            const count = c.count || 0;
            totals.clicked += count;
            clickTotalForPoint += count;

            const label =
              c.button_content ||
              (c.type === "url_button"
                ? "Visit Website"
                : c.type === "phone_number_button"
                  ? "Call Phone"
                  : c.type || "Button");
            const key = `${c.type || "button"}:${label}`;
            if (!buttonBreakdown[key]) {
              buttonBreakdown[key] = { label, count: 0 };
            }
            buttonBreakdown[key].count += count;
          });
        }

        if (pt.start) {
          // Format label matching UTC date
          const dateKey = ptDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          });

          if (!dailyMap[dateKey]) {
            dailyMap[dateKey] = {
              date: dateKey,
              rawTimestamp: pt.start,
              sent: 0,
              delivered: 0,
              read: 0,
              clicked: 0,
            };
          }

          dailyMap[dateKey].sent += sentVal;
          dailyMap[dateKey].delivered += deliveredVal;
          dailyMap[dateKey].read += readVal;
          dailyMap[dateKey].clicked += clickTotalForPoint;
        }
      });
    }

    const sortedChart = Object.values(dailyMap).sort(
      (a, b) => a.rawTimestamp - b.rawTimestamp
    );

    return {
      stats: totals,
      chartData: sortedChart,
      buttonClicksList: Object.values(buttonBreakdown),
    };
  }, [analyticsData, selectedRange, customStart, customEnd]);

  const deliveryRate =
    stats.sent > 0 ? Math.round((stats.delivered / stats.sent) * 100) : 0;
  const readRate =
    stats.delivered > 0 ? Math.round((stats.read / stats.delivered) * 100) : 0;
  const clickRate =
    stats.delivered > 0 ? Math.round((stats.clicked / stats.delivered) * 100) : 0;

  const costPerDelivered =
    stats.delivered > 0 ? (stats.amount_spent / stats.delivered).toFixed(4) : "0.00";
  const costPerClick =
    stats.clicked > 0 ? (stats.amount_spent / stats.clicked).toFixed(4) : "0.00";

  const isStartTimeError =
    errorDetails?.error_subcode === 4182005 ||
    errorDetails?.code === 100 ||
    errorDetails?.message?.toLowerCase().includes("start time") ||
    errorDetails?.error_user_msg?.toLowerCase().includes("start time") ||
    error?.toLowerCase().includes("start time") ||
    error?.toLowerCase().includes("invalid parameter");

  const { minDateStr, maxDateStr } = useMemo(() => {
    const today = new Date();
    const maxStr = today.toISOString().split("T")[0];

    const past88 = new Date();
    past88.setDate(past88.getDate() - 88);
    const minStr = past88.toISOString().split("T")[0];

    return { minDateStr: minStr, maxDateStr: maxStr };
  }, []);

  const toggleMetric = (key) => {
    setActiveSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAFC] p-5 sm:p-6 lg:p-7 space-y-5 font-sans text-[#172033]">
      {/* ── TOP BAR: Title + Filters in One Clean Line ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
            Template Analytics
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Engagement and delivery metrics from Meta
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Custom Searchable Template Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen((prev) => !prev);
                setIsRangeOpen(false);
                setTemplateSearch("");
              }}
              className="h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-[#172033] flex items-center justify-between gap-2 shadow-2xs hover:border-[#165DFF]/40 transition min-w-[200px] max-w-[280px] cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <FileText size={13} className="text-[#165DFF] shrink-0" />
                <span className="truncate">
                  {activeTemplate ? activeTemplate.name : "Select Template"}
                </span>
              </div>
              <ChevronDown
                size={13}
                className={`text-[#94A3B8] transition-transform duration-200 shrink-0 ${isDropdownOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="relative mb-1.5">
                  <Search
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                  />
                  <input
                    type="text"
                    autoFocus
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full pl-7 pr-7 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#165DFF] transition"
                  />
                  {templateSearch && (
                    <button
                      type="button"
                      onClick={() => setTemplateSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#172033]"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-0.5 divide-y divide-slate-50">
                  {filteredTemplates.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#94A3B8]">
                      No templates match "{templateSearch}"
                    </div>
                  ) : (
                    filteredTemplates.map((tpl) => {
                      const isSelected =
                        String(tpl.template_id || tpl.id) ===
                        String(activeTemplate?.template_id || activeTemplate?.id);

                      return (
                        <button
                          key={tpl.id || tpl.template_id}
                          type="button"
                          onClick={() => {
                            setSelectedTemplateId(tpl.template_id || tpl.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition cursor-pointer ${isSelected
                            ? "bg-blue-50 text-[#165DFF] font-semibold"
                            : "hover:bg-slate-50 text-[#172033] font-medium"
                            }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs">{tpl.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-[#64748B] uppercase">
                                {tpl.category}
                              </span>
                              <span className="text-[10px] text-[#CBD5E1]">•</span>
                              <span
                                className={`text-[10px] font-semibold ${tpl.status === "APPROVED"
                                  ? "text-emerald-600"
                                  : tpl.status === "REJECTED"
                                    ? "text-red-500"
                                    : "text-amber-600"
                                  }`}
                              >
                                {tpl.status}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <Check size={14} className="text-[#165DFF] shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Custom Date Range Popover */}
          <div className="relative" ref={rangeRef}>
            <button
              type="button"
              onClick={() => {
                setIsRangeOpen((prev) => !prev);
                setIsDropdownOpen(false);
              }}
              className="h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-[#172033] flex items-center justify-between gap-2 shadow-2xs hover:border-[#165DFF]/40 transition min-w-[135px] cursor-pointer"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Calendar size={13} className="text-[#165DFF] shrink-0" />
                <span className="truncate">{activeRangeLabel}</span>
              </div>
              <ChevronDown
                size={13}
                className={`text-[#94A3B8] transition-transform duration-200 shrink-0 ${isRangeOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {isRangeOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="space-y-0.5">
                  {DATE_RANGE_OPTIONS.map((opt) => {
                    const isSelected = selectedRange === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSelectedRange(opt.value);
                          setIsRangeOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${isSelected
                          ? "bg-blue-50 text-[#165DFF] font-semibold"
                          : "hover:bg-slate-50 text-[#172033] font-medium"
                          }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && (
                          <Check size={14} className="text-[#165DFF] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {selectedRange === "custom" && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 shadow-2xs h-9">
              <input
                type="date"
                min={minDateStr}
                max={customEnd || maxDateStr}
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="text-xs text-[#172033] focus:outline-none cursor-pointer"
              />
              <span className="text-xs text-[#64748B]">to</span>
              <input
                type="date"
                min={customStart || minDateStr}
                max={maxDateStr}
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="text-xs text-[#172033] focus:outline-none cursor-pointer"
              />
            </div>
          )}

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchAnalytics}
            disabled={loading}
            className="h-9 w-9 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-[#64748B] hover:text-[#172033] transition shadow-2xs cursor-pointer disabled:opacity-50 flex items-center justify-center"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#165DFF]" : ""} />
          </button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-300 p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <Loader2 size={24} className="animate-spin text-[#165DFF] mb-2.5" />
          <p className="text-xs font-semibold text-[#64748B]">Loading analytics...</p>
        </div>
      ) : error ? (
        isStartTimeError ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-xs shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-amber-900">
                  No data available for this range
                </p>
                <p className="text-amber-800 mt-0.5 leading-relaxed text-xs">
                  Meta only holds analytics for recent dates and after the template was created.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRange("29")}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs transition cursor-pointer"
                  >
                    Switch to Last 30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRange("6")}
                    className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold rounded-lg text-xs transition cursor-pointer"
                  >
                    Last 7 Days
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs shadow-sm flex items-center gap-2.5">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )
      ) : (
        <div className="space-y-5">
          {/* ── CARD 1: 4 SIMPLE CLEAN KPI CARDS (Matching Dashboard Style) ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-300 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B]">Sent</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Send size={15} className="text-[#165DFF]" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-[#172033] mt-2 tabular-nums">
                {stats.sent}
              </p>
              <p className="text-[11px] text-[#94A3B8] mt-1">Dispatched</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-300 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B]">Delivered</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-[#172033] mt-2 tabular-nums">
                {stats.delivered}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                {deliveryRate}% delivery rate
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-300 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B]">Read</span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center">
                  <Eye size={15} className="text-[#8B5CF6]" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-[#172033] mt-2 tabular-nums">
                {stats.read}
              </p>
              <p className="text-[11px] text-purple-600 font-semibold mt-1">
                {readRate}% open rate
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-300 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B]">Clicked</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <MousePointerClick size={15} className="text-amber-600" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-[#172033] mt-2 tabular-nums">
                {stats.clicked}
              </p>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">
                {clickRate}% CTR
              </p>
            </div>
          </div>

          {/* ── CARD 2: DEDICATED SEPARATE GRAPH CARD (Exact Meta Performance Trend) ── */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[#165DFF]" />
                <h3 className="text-sm font-bold text-[#172033] tracking-tight">
                  Performance Trend
                </h3>
              </div>

              {/* Interactive Series Legend Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                {METRIC_CONFIG.map((m) => {
                  const isActive = activeSeries[m.key];
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => toggleMetric(m.key)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${isActive
                        ? "bg-slate-50 border-slate-300 text-[#172033]"
                        : "bg-white border-slate-200 text-[#94A3B8] opacity-60"
                        }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: isActive ? m.color : "#CBD5E1" }}
                      />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Line / Area Chart */}
            <div className="h-64 sm:h-72 w-full pt-2">
              {chartData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-xs text-[#94A3B8] border border-dashed border-slate-200 rounded-xl">
                  No time-series data points available for this range
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorClicked" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={{ stroke: "#CBD5E1" }}
                      tick={{ fill: "#64748B", fontSize: 11 }}
                      minTickGap={24}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={{ stroke: "#CBD5E1" }}
                      tick={{ fill: "#64748B", fontSize: 11 }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        return (
                          <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-2.5 text-xs font-sans min-w-[150px]">
                            <p className="font-bold text-[#172033] border-b border-slate-100 pb-1 mb-1.5">
                              {label}
                            </p>
                            <div className="space-y-1">
                              {payload.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between gap-3 text-[11px]"
                                >
                                  <span className="flex items-center gap-1.5 text-[#64748B]">
                                    <span
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: item.color }}
                                    />
                                    {item.name}:
                                  </span>
                                  <span className="font-bold text-[#172033] tabular-nums">
                                    {item.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }}
                    />
                    {activeSeries.sent && (
                      <Area
                        type="monotone"
                        dataKey="sent"
                        name="Messages sent"
                        stroke="#6366F1"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSent)"
                      />
                    )}
                    {activeSeries.delivered && (
                      <Area
                        type="monotone"
                        dataKey="delivered"
                        name="Messages delivered"
                        stroke="#10B981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorDelivered)"
                      />
                    )}
                    {activeSeries.read && (
                      <Area
                        type="monotone"
                        dataKey="read"
                        name="Messages read"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRead)"
                      />
                    )}
                    {activeSeries.clicked && (
                      <Area
                        type="monotone"
                        dataKey="clicked"
                        name="Unique clicks"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorClicked)"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ── CARD 3: COST INSIGHTS (Full Width) ── */}
          <div className="bg-white rounded-2xl p-5 border border-slate-300 shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-bold text-[#172033] uppercase tracking-wider flex items-center gap-1.5">
                <Receipt size={15} className="text-emerald-600" /> Cost Insights
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Meta Usage
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200">
                <span className="text-[10px] font-medium text-[#64748B] block">Total Spent</span>
                <p className="text-lg sm:text-xl font-bold text-[#172033] mt-1 tabular-nums">
                  ₹{stats.amount_spent.toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200">
                <span className="text-[10px] font-medium text-[#64748B] block">Cost / Delivered</span>
                <p className="text-lg sm:text-xl font-bold text-[#172033] mt-1 tabular-nums">
                  ₹{costPerDelivered}
                </p>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200">
                <span className="text-[10px] font-medium text-[#64748B] block">Cost / Click</span>
                <p className="text-lg sm:text-xl font-bold text-[#172033] mt-1 tabular-nums">
                  ₹{costPerClick}
                </p>
              </div>
            </div>
          </div>

          {/* ── CARD 4: BUTTON CLICKS (Full Width - Only shows if clicks exist) ── */}
          {buttonClicksList.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-300 shadow-sm">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-bold text-[#172033] uppercase tracking-wider flex items-center gap-1.5">
                  <MousePointerClick size={15} className="text-amber-600" /> Button Clicks
                </span>
                <span className="text-[11px] font-semibold text-[#172033] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {stats.clicked} clicks
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {buttonClicksList.map((btn, idx) => {
                  const pctVal =
                    stats.clicked > 0
                      ? Math.round((btn.count / stats.clicked) * 100)
                      : 0;
                  return (
                    <div
                      key={idx}
                      className="bg-slate-50/80 rounded-xl p-3 border border-slate-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#172033] truncate">
                          {btn.label}
                        </span>
                        <span className="font-bold text-[#172033] tabular-nums">
                          {btn.count}{" "}
                          <span className="text-[#64748B] font-normal text-[11px]">
                            ({pctVal}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${pctVal}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplateAnalytics;
